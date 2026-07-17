// ================================================================
// Backend Model Types - Synced with FastAPI Backend
// ================================================================

// ----------------------------------------------------------------
// ENUMS
// ----------------------------------------------------------------
export type UserRole = 'student' | 'teacher' | 'admin'

export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'destroying' | 'destroyed' | 'cancelled' | 'pausing' | 'paused' | 'resuming' | 'pause_failed' | 'resume_failed'

export type TaskType = 'deploy' | 'destroy' | 'update' | 'pause' | 'resume' | 'redeploy'

export type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

// ----------------------------------------------------------------
// USER TYPES
// ----------------------------------------------------------------
export interface User {
  userId: string
  email: string
  username: string
  role: UserRole
  courseId: string | null
  created_at: string
}

export interface UserWithCourse extends User {
  course: Course | null
}

export interface UserStatistics {
  total_apps: number
  total_deployments: number
  successful_deployments: number
  failed_deployments: number
  pending_deployments: number
}

export interface UserCreate {
  email: string
  password: string
  username: string
  role?: UserRole
  courseId?: string | null
}

export interface UserUpdate {
  email?: string
  username?: string
  role?: UserRole
  courseId?: string | null
}

export interface UserPasswordUpdate {
  current_password: string
  new_password: string
}

// ----------------------------------------------------------------
// COURSE TYPES
// ----------------------------------------------------------------
export interface Course {
  courseId: string
  name: string
}

export interface CourseWithUsers extends Course {
  users: User[]
}

export interface CourseCreate {
  name: string
}

export interface CourseUpdate {
  name?: string
}

// ----------------------------------------------------------------
// APP TYPES
// ----------------------------------------------------------------
export interface App {
  appId: string
  name: string
  description: string | null
  git_link: string | null
  userId: string
  created_at: string
  releaseTag: string
  is_private: boolean
  // Data-URL ("data:image/png;base64,...") or null when the app
  // has no logo. Goes straight into ``<img :src=...>``.
  image?: string | null
}

export interface AppWithUser extends App {
  user: User
}

export interface AppCreate {
  name: string
  description?: string | null
  git_link?: string | null
  releaseTag?: string
  is_private?: boolean
  submit_all_versions?: boolean
  // Data-URL of the logo. Use the FileReader.readAsDataURL output.
  // Omit / null = no logo.
  image?: string | null
}

export interface AppUpdate {
  name?: string
  description?: string | null
  is_private?: boolean
  // Data-URL ("data:image/...;base64,..."), empty string to clear
  // the existing image, or undefined to leave unchanged.
  image?: string | null
}

// ----------------------------------------------------------------
// APP VERSION APPROVAL TYPES
// ----------------------------------------------------------------
export type AppVersionApprovalStatus = 'pending' | 'approved' | 'rejected'

export type AppVersionBadgeStatus = 'new' | 'pending' | 'approved' | 'published' | 'rejected' | 'private'

export interface AppVersionApproval {
  approvalId: string
  appId: string
  version_tag: string
  status: AppVersionApprovalStatus
  diff_url: string | null
  notes: string | null
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface AppVersionApprovalWithApp extends AppVersionApproval {
  app: App
}

// ----------------------------------------------------------------
// DEPLOYMENT TYPES
// ----------------------------------------------------------------
export interface Deployment {
  deploymentId: string
  name: string
  appId: string
  userId: string
  status: DeploymentStatus
  commitHash: string | null
  commitInfo: string | null
  userInputVar: string | null
  releaseTag: string
  created_at: string
}

export interface DeploymentTeamMember {
  userId: string
  email: string
  username: string
}

export interface DeploymentTeam {
  teamId: string
  name: string
  members: DeploymentTeamMember[]
}

export interface DeploymentWithRelations extends Deployment {
  user: User
  app: App
  latest_task?: {
    taskId: string;
    type: string;
    status: string;
    started_at: string | null;
    finished_at: string | null;
    created_at: string;
  } | null;
  // Teams + members from the DeploymentDetail backend response. Used
  // by the Teams card on the deployment detail page (resend-access
  // buttons hang off of these IDs).
  teams?: DeploymentTeam[];
  outputs?: any;
  logs?: string | null;
}

export interface DeploymentCreate {
  name: string
  appId: string
  commitHash?: string | null
  commitInfo?: string | null
  userInputVar?: Record<string, any> | null
  releaseTag: string
  teams?: Array<{ name: string; userIds: string[] }>
  // Files-map keyed by ``@openstack:file:<scope>``-marked variable
  // name. Inner key:
  //   * scope = all  → exactly one inner key (conventionally "all")
  //   * scope = team → one entry per team name
  //   * scope = user → one entry per ``Team-User`` composite key
  // The wizard owns the keys; the backend persists the map verbatim
  // into ``userInputVar.terraform`` so the worker can pass it through
  // to terraform as a typed map.
  files?: Record<string, Record<string, DeploymentFile>>
}

/**
 * One uploaded file as it travels from wizard → POST /deployments
 * → backend persistence → terraform variable. ``content_b64`` is the
 * raw base64 payload (no ``data:...,`` wrapper); the rest is the
 * metadata the user-data template needs to land the file on disk.
 */
export interface DeploymentFile {
  name: string
  content_b64: string
  size: number
  content_type?: string
}

export interface DeploymentUpdate {
  name?: string
  status?: DeploymentStatus
  commitHash?: string | null
  commitInfo?: string | null
  userInputVar?: string | null
}

// ----------------------------------------------------------------
// DEPLOYMENT INFRASTRUCTURE / RESOURCE TYPES
// ----------------------------------------------------------------
//
// Mirrors ``app/services/deployment_status.py`` and the schemas in
// ``app/schemas.py``. The list endpoint ships Stage-1 fields
// (lifecycle, hardware, addresses); the detail endpoint also fills
// the Stage-2 fields (ports, security_groups, volumes, metadata).

/** ``in_sync`` = TF-cached attrs match live OpenStack;
 *  ``stale``   = live fetch failed/timed out, fall back to cache;
 *  ``missing`` = live fetch confirmed the resource is gone. */
export type ResourceDrift = 'in_sync' | 'stale' | 'missing'

/** Coarse category the Infrastructure tab groups by. */
export type DeploymentResourceCategory =
  | 'instance'
  | 'network'
  | 'subnet'
  | 'security_group'
  | 'floating_ip'
  | 'port'

export interface LifecycleStates {
  /** OpenStack server ``status``, e.g. ``ACTIVE``/``BUILD``/``ERROR``. */
  status: string | null
  /** Transient action, e.g. ``spawning``/``networking``/``deleting``. */
  task_state: string | null
  vm_state: string | null
  /** Nova power-state already translated to label
   *  (``RUNNING``/``SHUTDOWN``/``CRASHED``/...). */
  power_state: string | null
  /** Filled when ``status === 'ERROR'`` — the underlying Nova fault
   *  message. UI shows it as a red banner under the VM card. */
  fault_message: string | null
}

export interface HardwareSpec {
  flavor_name: string | null
  ram_mb: number | null
  vcpus: number | null
  disk_gb: number | null
  image_id: string | null
  /** Stage-1 leaves this null (no extra API hop); Stage-2 resolves it. */
  image_name: string | null
  availability_zone: string | null
  /** ISO-8601 timestamp; frontend computes uptime against ``Date.now()``. */
  launched_at: string | null
}

export interface NetworkAddress {
  network: string
  fixed_ip: string | null
  floating_ip: string | null
  mac: string | null
}

export interface NetworkPort {
  port_id: string
  network_id: string | null
  status: string | null
  mac: string | null
  fixed_ip: string | null
  security_group_ids: string[]
}

export interface SecurityGroupSummary {
  id: string
  name: string
  description: string | null
  ingress_rules: number
  egress_rules: number
}

export interface VolumeAttachment {
  volume_id: string
  device: string | null
  size_gb: number | null
  bootable: boolean | null
  status: string | null
  name: string | null
}

export interface DeploymentResource {
  /** Terraform state address — round-trippable to the redeploy endpoint. */
  address: string
  /** Raw HCL resource type, e.g. ``openstack_compute_instance_v2``. */
  type: string
  category: DeploymentResourceCategory
  team: string | null
  provider_id: string
  display_name: string
  drift: ResourceDrift
  // Stage-1 (instance-only)
  lifecycle: LifecycleStates | null
  hardware: HardwareSpec | null
  addresses: NetworkAddress[]
  // Stage-2 (instance-only, only populated on the detail endpoint)
  ports?: NetworkPort[] | null
  security_groups?: SecurityGroupSummary[] | null
  volumes?: VolumeAttachment[] | null
  metadata?: Record<string, string> | null
}

export interface DeploymentResourceListResponse {
  resources: DeploymentResource[]
  /** ``true`` when the backend overlaid live OpenStack data;
   *  ``false`` when ``refresh=false`` was requested. */
  live: boolean
}

// ----------------------------------------------------------------
// TASK TYPES
// ----------------------------------------------------------------
export interface TaskLogEntry {
  timestamp: string
  level: string
  category?: string
  message: string
  [key: string]: any // Allow additional fields like operation, resource_type, etc.
}

export interface TaskLogsObject {
  error?: string
  deployment_id?: string
  logs?: TaskLogEntry[]
  tf_state?: any
  commit_info?: any
  terraform_outputs?: any
}

export interface Task {
  taskId: string
  deploymentId: string
  celeryTaskId: string
  type: TaskType
  status: TaskStatus
  started_at: string | null
  finished_at: string | null
  logs: string | TaskLogsObject | null
  tf_state: string | object | null
  outputs: string | object | null
  // Live-progress fields. Backend persists them while the worker is
  // running so a page reload mid-deploy shows the last known phase
  // and percent without waiting for the next SSE event.
  current_phase: string | null
  progress_pct: number | null
  created_at: string
}

// ----------------------------------------------------------------
// AUTH TYPES
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// AUTH TYPES (moved to auth.api.ts)
// ----------------------------------------------------------------
// export interface LoginCredentials
// export interface RegisterData  
// export interface AuthToken
// These are now in auth.api.ts

// ----------------------------------------------------------------
// API RESPONSE TYPES
// ----------------------------------------------------------------
export interface ApiError {
  detail: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

// ----------------------------------------------------------------
// QUERY PARAMS
// ----------------------------------------------------------------
export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface UserQueryParams extends PaginationParams {
  role?: UserRole
  courseId?: string
}

export interface AppQueryParams extends PaginationParams {
  userId?: string
}

export interface DeploymentQueryParams extends PaginationParams {
  userId?: string
  appId?: string
  status?: DeploymentStatus
}


// ================================================================
// FRONTEND UI TYPES (Wizard State & Helper)
// ================================================================

// 1. Erweiterte App-Konfiguration für die UI (Summary View)
// Diese Daten kommen evtl. später hardcoded aus dem Frontend oder als JSON vom Backend
export interface AppUIConfig {
  flavor: string      // z.B. "m1.medium"
  image: string       // z.B. "kali:latest"
  ports: string       // z.B. "22, 8080"
  network: string     // z.B. "Isolated VLAN"
  software: string    // z.B. "Wireshark"
  secGroup?: string   // z.B. "SSH only"
  storage?: string    // z.B. "40 GB"
}

// Wir erweitern deinen Backend-App-Typ für die Nutzung im Store
export interface AppDefinition extends App {
  // Optional, da nicht jede App Configs haben muss oder diese erst gemockt werden
  defaultConfig?: AppUIConfig 
  // Icon Name als String für Lucide Icons (z.B. "Terminal", "ShieldAlert")
  iconStr?: string 
}

// 2. Wizard State (Der "Warenkorb" vor dem Absenden)
export type GroupMode = 'one' | 'eachUser' | 'custom'

export interface DeploymentDraft {
  // Schritt 1: App Auswahl
  appId: string | null
  
  // Schritt 2: Basis Konfiguration
  name: string
  courseIds: string[]    // Mehrere Kurse möglich
  studentIds: string[]   // Ausgewählte Studenten IDs
  
  // Schritt 3: Gruppen Anzahl
  groupMode: GroupMode
  groupCount: number,
  userInputVar: Record<string, any> | string // Kann Object oder JSON-String sein
  
  // Schritt 4: Zuweisung (Wer ist in welcher Gruppe?)
  // Key = Gruppen-Index (0, 1, 2...), Value = Array von UserIDs
  assignments: Record<number, string[]>
  releaseTag: string
          // Für den JSON-String aus dem Textfeld
  variables: Record<string, any> // Für die geparsten/gemergten Variablen
  version: string                // Optional, falls du es explizit brauchst
  groupNames: string[]
  variableDefinitions?: AppVariable[] // API-Definitionen für die Variablen
  // Wizard-side state for ``@openstack:file:<scope>``-marked
  // variables. Outer key: variable name. Inner key: scope-specific
  // routing token (``"all"`` for scope=all, team name for scope=team,
  // ``Team-User`` composite for scope=user). The store flushes this
  // verbatim into ``DeploymentCreate.files`` on submit.
  fileUploads?: Record<string, Record<string, DeploymentFile>>
}

// 3. Helper Type für die finale Zusammenfassung
export interface WizardSummary {
  appName: string
  deploymentName: string
  totalStudents: number
  totalGroups: number
  config: AppUIConfig | undefined
}

export interface AppVariable {
  name: string
  type: string
  description?: string
  // Backend coerces the HCL default literal to its native Python type
  // (siehe ``apps.py`` Bug #7-Fix): ``number`` → number, ``bool`` →
  // boolean, ``list/set/tuple`` → Array, ``map(...)`` → Object,
  // ``null`` → null (in dem Fall setzt das Backend zusätzlich
  // ``required = true``). Strings bleiben Strings — ohne äußere
  // Quotes. ``unknown[]`` / ``Record<string, unknown>`` statt ``any``,
  // damit Konsumenten den Wert vor der Verwendung narrowen müssen.
  default?: string | number | boolean | unknown[] | Record<string, unknown> | null
  required?: boolean
  // ADD THIS PROPERTY:
  source?: 'terraform' | 'packer' | 'unknown'
  // Value-Help-Metadaten — gefüllt vom Backend, wenn die Variable
  // einen ``@openstack:<type>[:<mode>][:<multi>]``-Marker in der
  // ``description`` trägt. Ohne Marker bleibt das Feld undefined und
  // das Frontend rendert einen Free-Text-Input. Es gibt KEINE
  // Auto-Detection auf Variablennamen oder Description-Inhalt.
  osType?: AppVariableOsType
  // 'id' (UUID) oder 'name'. Wird vom Backend gesetzt — entweder
  // explizit aus dem Marker (``:id`` / ``:name``) oder per Default
  // ('name' für die meisten Resource-Kinds).
  osMode?: 'id' | 'name'
  // Multi-Select — vom Backend aus Marker (``:multi`` / ``:single``)
  // ODER aus dem HCL-Type abgeleitet (``list(string)``/``set(...)``
  // → multi).
  osMulti?: boolean
  // Scope für ``@openstack:file:<scope>``. Nur gesetzt wenn
  // ``osType === 'file'``. Bestimmt, ob der Wizard genau eine
  // FileDropZone (``all``), eine pro Team (``team``) oder eine pro
  // User (``user``) rendert. ``osMode`` und ``osMulti`` bleiben für
  // file-Variablen ungesetzt — das Frontend liest am ``osScope``,
  // nicht am Mode/Multi-Slot.
  osScope?: 'all' | 'team' | 'user'
  // Per-Variable-Scope für ALLE Variablen, unabhängig vom Resource-
  // Type. ``all`` (default) → ein Wert für alle. ``team`` → ein Wert
  // pro Team. ``user`` → ein Wert pro User (Composite-Slot-Key
  // ``TeamName-Username``). Backend setzt das aus dem optionalen
  // vierten Marker-Slot (z.B. ``@openstack:flavor:id:single:team``
  // oder dem reinen Scope-Marker ``@openstack:::team``). Für file-
  // Variablen wird das Feld vom Backend mit ``osScope`` synchron
  // gehalten, sodass das Frontend für die Slot-Berechnung nur EINE
  // Quelle lesen muss.
  varScope?: 'all' | 'team' | 'user'
  // Erlaubte Dateiendungen für ``@openstack:file:<scope>:<exts>``.
  // Pflicht bei File-Variablen — der Wizard nutzt das als
  // ``accept``-Attribut der FileDropZone, das Backend rejected jeden
  // Upload mit einer nicht-aufgeführten Endung mit 422.
  fileExtensions?: string[]
  // Marker-Fehler. Backend setzt das, wenn die Variable einen
  // ``@openstack``-Marker hat aber dieser malformiert oder
  // widersprüchlich ist. Frontend zeigt das als Inline-Banner an
  // der Variable, rendert sie aber als normalen Free-Text-Input,
  // damit der Wizard nutzbar bleibt.
  markerError?: AppVariableMarkerError
  // Multi-Image-Apps: Schlüssel des Packer-Templates, zu dem diese
  // Variable gehört. Vom Backend gesetzt für ``source === 'packer'``
  // (z.B. ``"webserver"`` oder ``"database"``). Legacy-Apps mit einem
  // einzigen ``packer/template.pkr.hcl`` erhalten den Sentinel
  // ``"default"``. Für ``source === 'terraform'`` bleibt das Feld
  // ``null``/undefined.
  template_key?: string | null
}

export interface AppVariableMarkerError {
  variable: string
  message: string
  // ``terraform/variables.tf:42``-style Hint, damit App-Autoren den
  // Bug ohne Grep finden.
  location?: string
  // Stabile Error-Codes (z.B. ``MARKER_WHITESPACE``,
  // ``MARKER_UNKNOWN_OS_TYPE``) — Backend setzt das parallel zur
  // deutschen ``message``-Property, damit das Frontend ohne
  // String-Matching i18n machen kann. Schema-readiness für Bug #15;
  // Übersetzungen folgen später.
  code?: string
}

// ----------------------------------------------------------------
// OPENSTACK DISPLAY-CACHE TYPES
// ----------------------------------------------------------------
/**
 * Return-Shape von ``useOpenStackResourceCache.getDisplayName``.
 *
 * ``known = true`` heißt: Wert wurde im geladenen Cache gefunden und
 * ``name`` ist die menschenlesbare Bezeichnung. ``known = false``
 * heißt: Wert ist im Cache nicht enthalten — Aufrufer rendert den
 * Rohwert und kann optional eine "unbekannt"-Markierung zeigen.
 *
 * ``modeMismatch = true`` signalisiert, dass der Wert nicht im
 * angeforderten Mode (z.B. ``id``) gefunden wurde, aber im anderen
 * Mode (``name``) ein Treffer existiert — die Variable speichert also
 * eine UUID, während der Default ein Name ist (oder umgekehrt).
 * Konsumenten können das als subtilen Hinweis ("falscher Mode-Default")
 * rendern.
 */
export interface OpenStackDisplayName {
  name: string
  known: boolean
  modeMismatch?: boolean
}

// Liste der unterstützten OpenStack-Resource-Types. MUSS konsistent
// sein mit:
//  - backend/app/routers/apps.py (``_OS_TYPES``)
//  - backend/app/routers/openstack_resources.py (Listen-Endpoints)
//  - frontend/src/api/openstack-resources.api.ts (``OsResourceType``)
//  - frontend/src/components/OpenStackResourcePicker.vue (Render)
export type AppVariableOsType =
  | 'network'
  | 'subnet'
  | 'flavor'
  | 'image'
  | 'keypair'
  | 'security_group'
  | 'floating_ip_pool'
  | 'volume'
  | 'router'
  | 'availability_zone'
  // ``file`` is a pseudo-resource: not picked from a remote API but
  // rendered as a FileDropZone widget that produces a base64 payload
  // shipped to the backend in ``DeploymentCreate.files``. The
  // ``osScope`` field tells the wizard whether to render one zone
  // (``all``), one per team (``team``) or one per user (``user``).
  | 'file'