/**
 * Read API for the current user's OpenStack resources.
 *
 * Used by the ``OpenStackResourcePicker`` so wizard users don't have to copy
 * UUIDs from Horizon. The backend caches responses for 60s, so the frontend can
 * call freely without triggering a Keystone token storm.
 *
 * Error strategy: the backend answers 412 (credentials missing) / 502
 * (OpenStack API down) / 200 (with data); the picker reads the status and
 * renders the matching fallback.
 */
import api from './axios'

// ----------------------------------------------------------------
// Resource shapes — kept flat, only what the UI needs.
// ----------------------------------------------------------------
export interface OsResourceBase {
  id: string
  name: string
}

export interface OsNetwork extends OsResourceBase {
  description: string
  shared: boolean
  external: boolean
  status: string
}

export interface OsSubnet extends OsResourceBase {
  cidr: string
  ip_version: number
  network_id: string
  gateway_ip: string
}

export interface OsFlavor extends OsResourceBase {
  vcpus: number
  ram: number   // MB
  disk: number  // GB
  is_public: boolean
}

export interface OsImage extends OsResourceBase {
  status: string
  visibility: string
  size: number
  disk_format: string
}

export interface OsKeypair extends OsResourceBase {
  fingerprint: string
  type: string
}

export interface OsSecurityGroup extends OsResourceBase {
  description: string
}

export interface OsFloatingIpPool extends OsResourceBase {
  description: string
}

export interface OsVolume extends OsResourceBase {
  size: number
  status: string
  volume_type: string
  bootable: boolean
}

export interface OsRouter extends OsResourceBase {
  status: string
  external_gateway_info: any
}

export interface OsAvailabilityZone extends OsResourceBase {
  state: string
}

// Discriminated union of supported resource types — must stay exactly in sync
// with ``backend/app/routers/apps.py:_OS_TYPES``.
export type OsResourceType =
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

// ----------------------------------------------------------------
// Endpoints
// ----------------------------------------------------------------
export const openstackResourcesApi = {
  listNetworks: () => api.get<OsNetwork[]>('/me/openstack/resources/networks'),

  listSubnets: (networkId?: string) =>
    api.get<OsSubnet[]>('/me/openstack/resources/subnets', {
      params: networkId ? { network_id: networkId } : undefined,
    }),

  listFlavors: () => api.get<OsFlavor[]>('/me/openstack/resources/flavors'),

  listImages: (statusFilter: string = 'active') =>
    api.get<OsImage[]>('/me/openstack/resources/images', {
      params: { status: statusFilter },
    }),

  listKeypairs: () => api.get<OsKeypair[]>('/me/openstack/resources/keypairs'),

  listSecurityGroups: () =>
    api.get<OsSecurityGroup[]>('/me/openstack/resources/security-groups'),

  listFloatingIpPools: () =>
    api.get<OsFloatingIpPool[]>('/me/openstack/resources/floating-ip-pools'),

  listVolumes: () => api.get<OsVolume[]>('/me/openstack/resources/volumes'),

  listRouters: () => api.get<OsRouter[]>('/me/openstack/resources/routers'),

  listAvailabilityZones: (service: 'compute' | 'network' | 'volume' = 'compute') =>
    api.get<OsAvailabilityZone[]>('/me/openstack/resources/availability-zones', {
      params: { service },
    }),

  /** Cache-bust for the user. ``kind`` optional, otherwise everything. */
  refresh: (kind?: OsResourceType) =>
    api.post('/me/openstack/resources/refresh', null, {
      params: kind ? { kind } : undefined,
    }),
}
