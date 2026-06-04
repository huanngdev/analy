export const SERVICE_TYPES = ["postgresql"] as const;

export const SERVICE_STATUSES = [
  "provisioning",
  "starting",
  "ready",
  "stopping",
  "stopped",
  "failed",
  "deleting",
] as const;

export const POSTGRES_VERSIONS = ["17", "16", "15"] as const;

export const POSTGRES_HARDWARE_PROFILES = [
  {
    cpuLimit: "0.50",
    id: "dev-light",
    memoryMb: 512,
    name: "Dev Light",
    storageMb: 1024,
  },
  {
    cpuLimit: "1.00",
    id: "dev-standard",
    memoryMb: 1024,
    name: "Dev Standard",
    storageMb: 3072,
  },
  {
    cpuLimit: "2.00",
    id: "dev-power",
    memoryMb: 2048,
    name: "Dev Power",
    storageMb: 5120,
  },
] as const;

export const DEFAULT_POSTGRES_VERSION = "17";
export const DEFAULT_POSTGRES_HARDWARE_PROFILE = "dev-standard";

export const POSTGRES_HARDWARE_PROFILE_IDS = POSTGRES_HARDWARE_PROFILES.map(
  (profile) => profile.id,
) as ["dev-light", "dev-standard", "dev-power"];
