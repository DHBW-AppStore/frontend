/**
 * Display cache for OpenStack resources.
 *
 * Background: depending on ``osMode`` the picker stores either the UUID
 * or the name of a resource. In the trigger button and the summary view
 * the user should ALWAYS see the friendly name — even when the stored
 * value is a UUID.
 *
 * Solution: a module-global cache, filled by every picker that loads.
 * - Multiple pickers for the same ``osType`` share the cache (no
 *   re-fetch).
 * - The summary view can read the cache synchronously via
 *   ``getDisplayName(osType, mode, value)``, OR trigger
 *   ``ensureLoaded(osType)`` once on mount.
 * - Cache TTL: matched to the backend cache (60s) — after that it is
 *   reloaded on the next picker open.
 *
 * REACTIVITY: the cache itself is a plain ``Map``, but a Vue ``ref``
 * (``cacheVersion``) is incremented on every ``prime``/``invalidate``.
 * Consumers read the cache via ``getDisplayName``, which also reads
 * ``cacheVersion.value`` — so the computeds calling it depend on Vue
 * reactivity and re-run as soon as another component updates the cache.
 */
import { ref } from 'vue'
import {
  openstackResourcesApi,
  type OsResourceType,
  type OsResourceBase,
} from '@/api/openstack-resources.api'

interface CachedItem {
  id: string
  name: string
  // Sekundäre Display-Info, falls vom Picker mitgegeben (z.B.
  // Flavor-Specs). Optional — Summary-View nutzt nur ``name``.
  secondary?: string
  raw: any
}

interface CacheEntry {
  items: CachedItem[]
  loadedAt: number
  // Pending-Promise — verhindert Donnerherden, wenn mehrere Picker
  // gleichzeitig dieselbe Liste anfordern.
  loading?: Promise<void>
}

// In-Memory-Cache, prozesslokal pro Browser-Tab. Reload löscht.
const cache = new Map<OsResourceType, CacheEntry>()

// Reaktiver Versions-Counter. JEDE Mutation des Caches incrementiert
// den. Konsumenten (Picker, Summary-View) lesen ``cacheVersion.value``
// in ihren computeds — Vue trackt die Abhängigkeit und re-läuft
// computeds, wenn der Cache sich ändert.
const cacheVersion = ref(0)

const TTL_MS = 60_000

/**
 * Holt einen Eintrag aus dem Cache, NICHT älter als TTL. Liefert
 * ``null``, wenn nicht vorhanden / abgelaufen.
 */
function getFresh(osType: OsResourceType): CacheEntry | null {
  const entry = cache.get(osType)
  if (!entry) return null
  if (Date.now() - entry.loadedAt > TTL_MS) return null
  return entry
}

/**
 * Stellt sicher, dass die Liste für ``osType`` geladen ist (oder
 * gerade lädt). Dedupliziert parallele Aufrufe.
 *
 * Optionale Filter (z.B. ``network_id`` für Subnets) werden NICHT
 * gecached — Filter-spezifische Listen sind die Verantwortung des
 * jeweiligen Pickers, nicht dieses zentralen Display-Caches.
 *
 * Wirft NICHT — Fehler werden geschluckt; Cache bleibt einfach leer.
 * Picker-Komponenten haben eigene Fehler-Anzeige.
 */
export async function ensureLoaded(osType: OsResourceType): Promise<void> {
  const fresh = getFresh(osType)
  if (fresh && !fresh.loading) return
  if (fresh?.loading) {
    await fresh.loading
    return
  }

  const loading = (async () => {
    try {
      const res = await fetchList(osType)
      cache.set(osType, {
        items: res.map(toCachedItem),
        loadedAt: Date.now(),
      })
      cacheVersion.value += 1
    } catch {
      // Bewusst kein Throw — Cache bleibt leer, Picker zeigt seine
      // eigene Error-UI.
    }
  })()

  // Pending-Marker setzen, damit parallele Aufrufe warten statt
  // selbst neu zu fetchen. ``cacheVersion`` NICHT incrementieren —
  // solange noch geladen wird, hat sich die sichtbare Cache-Sicht
  // nicht geändert.
  cache.set(osType, {
    items: cache.get(osType)?.items || [],
    loadedAt: cache.get(osType)?.loadedAt || 0,
    loading,
  })

  await loading
  // ``loading`` aus dem Eintrag wieder entfernen.
  const final = cache.get(osType)
  if (final) {
    delete final.loading
  }
}

/**
 * Schreibt eine bereits gefetchte Liste in den Cache. Wird vom Picker
 * aufgerufen, wenn er aus eigenen Gründen schon Items in der Hand hat
 * (z.B. mit Filter geladen, oder gerade refresht). Verhindert
 * Doppel-Fetch durch andere Picker oder die Summary.
 */
export function prime(osType: OsResourceType, items: ReadonlyArray<OsResourceBase & Record<string, any>>): void {
  cache.set(osType, {
    items: items.map(toCachedItem),
    loadedAt: Date.now(),
  })
  cacheVersion.value += 1
}

/**
 * Cache-Bust für genau einen ``osType`` (Refresh-Button).
 */
export function invalidate(osType: OsResourceType): void {
  if (cache.delete(osType)) {
    cacheVersion.value += 1
  }
}

/**
 * Komplette Cache-Invalidierung. Wird beim Logout aufgerufen — der
 * neue User hat seine eigenen OpenStack-Credentials, der Cache der
 * vorherigen Session darf nicht stehenbleiben.
 */
export function invalidateAll(): void {
  if (cache.size === 0) return
  cache.clear()
  cacheVersion.value += 1
}

/**
 * Synchroner Lookup. Liefert den Display-Namen für einen Roh-Wert
 * (UUID oder Name), abhängig vom Mode der Variable.
 *
 * - Mode='id', value=UUID → Lookup über ``items.id``, gibt ``name`` zurück
 * - Mode='name', value=name → bestätigt Existenz, gibt name zurück
 * - Cache-Miss / unbekannter Wert → gibt den Roh-Wert zurück mit
 *   ``known: false``
 * - Cross-Mode-Fallback: Trifft der primäre Mode-Lookup nicht zu, wird
 *   der ANDERE Mode probiert. Beispiel: Variable speichert UUIDs, aber
 *   der HCL-Default ist ein Name (Bug #4-Paar) — dann findet der
 *   id-Lookup nichts, der name-Lookup aber schon. In dem Fall liefern
 *   wir ``known: true`` mit ``modeMismatch: true``, damit der Caller
 *   einen subtilen Hinweis rendern kann ("falscher Mode-Default").
 *
 * Liefert ``null``, wenn ``value`` leer ist.
 *
 * Liest ``cacheVersion.value``, damit jede computed, die diese Funktion
 * aufruft, automatisch neu läuft, sobald sich der Cache ändert.
 */
export function getDisplayName(
  osType: OsResourceType,
  mode: 'id' | 'name',
  value: string | null | undefined,
): { name: string; known: boolean; modeMismatch?: boolean } | null {
  // Reaktive Abhängigkeit registrieren — siehe Modul-Docstring.
  void cacheVersion.value
  if (!value) return null
  const entry = cache.get(osType)
  if (!entry) {
    return { name: value, known: false }
  }
  const found = mode === 'id'
    ? entry.items.find((it) => it.id === value)
    : entry.items.find((it) => it.name === value)
  if (found) {
    return { name: found.name, known: true }
  }
  // Cross-Mode-Fallback: primärer Mode-Lookup ist gescheitert. Wir
  // probieren den jeweils anderen Mode — typischerweise speichert die
  // Variable UUIDs, der hinterlegte Default ist aber ein Name (oder
  // umgekehrt). Findet der Fallback ein Match, geben wir den Namen
  // zurück und setzen ``modeMismatch``, damit das UI dem Nutzer den
  // Mismatch sichtbar machen kann ohne den Wert zu blockieren.
  const fallback = mode === 'id'
    ? entry.items.find((it) => it.name === value)
    : entry.items.find((it) => it.id === value)
  if (fallback) {
    return { name: fallback.name, known: true, modeMismatch: true }
  }
  return { name: value, known: false }
}

// ----------------------------------------------------------------
// Internal: per-type Fetcher
// ----------------------------------------------------------------
async function fetchList(osType: OsResourceType): Promise<any[]> {
  switch (osType) {
    case 'network':
      return (await openstackResourcesApi.listNetworks()).data
    case 'subnet':
      return (await openstackResourcesApi.listSubnets()).data
    case 'flavor':
      return (await openstackResourcesApi.listFlavors()).data
    case 'image':
      return (await openstackResourcesApi.listImages('active')).data
    case 'keypair':
      return (await openstackResourcesApi.listKeypairs()).data
    case 'security_group':
      return (await openstackResourcesApi.listSecurityGroups()).data
    case 'floating_ip_pool':
      return (await openstackResourcesApi.listFloatingIpPools()).data
    case 'volume':
      return (await openstackResourcesApi.listVolumes()).data
    case 'router':
      return (await openstackResourcesApi.listRouters()).data
    case 'availability_zone':
      return (await openstackResourcesApi.listAvailabilityZones('compute')).data
  }
}

function toCachedItem(raw: any): CachedItem {
  return {
    id: raw.id ?? raw.name ?? '',
    name: raw.name ?? '',
    raw,
  }
}
