import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const SCHEMA_VERSION = 1;

export const schema = appSchema({
  version: SCHEMA_VERSION,
  tables: [
    /* ────────────────────────── surveys ────────────────────────── */
    tableSchema({
      name: 'surveys',
      columns: [
        // identity
        { name: 'local_id', type: 'string', isIndexed: true }, // client-generated idempotency key
        { name: 'server_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'surveyor_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string', isIndexed: true }, // draft|pending|syncing|synced|failed
        // section 1 — property
        { name: 'property_no', type: 'string' },
        { name: 'ulb_code', type: 'string', isIndexed: true },
        { name: 'ward_no', type: 'string', isIndexed: true },
        { name: 'is_slum', type: 'boolean' },
        // section 2 — owner
        { name: 'owner_name', type: 'string' },
        { name: 'respondent_name', type: 'string' },
        { name: 'relationship', type: 'string' },
        { name: 'mobile_no', type: 'string' },
        { name: 'family', type: 'number' },
        // section 3 — address
        { name: 'house_no', type: 'string' },
        { name: 'street', type: 'string' },
        { name: 'locality', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'pin_code', type: 'string' },
        // section 4 — taxation
        { name: 'assessment_year', type: 'string' },
        { name: 'ownership_type', type: 'string' },
        { name: 'property_type', type: 'string' },
        { name: 'property_use', type: 'string' },
        { name: 'situation', type: 'string' },
        { name: 'road_type', type: 'string' },
        { name: 'tax_rate_zone', type: 'string' },
        // section 5 — area
        { name: 'plot_sqft', type: 'number' },
        { name: 'plinth_sqft', type: 'number' },
        // section 6 — services
        { name: 'water_source', type: 'string' },
        { name: 'sanitation_type', type: 'string' },
        { name: 'solid_waste_type', type: 'string' },
        { name: 'electricity_no', type: 'string' },
        // section 7 — GIS
        { name: 'gps_lat', type: 'number', isOptional: true },
        { name: 'gps_lng', type: 'number', isOptional: true },
        { name: 'gps_accuracy', type: 'number', isOptional: true },
        { name: 'gps_captured_at', type: 'number', isOptional: true },
        // sync metadata
        { name: 'wizard_step', type: 'number' }, // 0..8
        { name: 'is_dirty', type: 'boolean', isIndexed: true }, // needs push?
        { name: 'last_error', type: 'string', isOptional: true },
        { name: 'retry_count', type: 'number' },
        { name: 'next_attempt_at', type: 'number', isOptional: true },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    /* ────────────────────────── floors ────────────────────────── */
    tableSchema({
      name: 'floors',
      columns: [
        { name: 'survey_id', type: 'string', isIndexed: true },
        { name: 'floor_name', type: 'string' },
        { name: 'usage_type', type: 'string' },
        { name: 'construction_type', type: 'string' },
        { name: 'is_occupied', type: 'boolean' },
        { name: 'area_sqft', type: 'number' },
        { name: 'position', type: 'number' }, // ordering
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    /* ────────────────────────── photos ────────────────────────── */
    tableSchema({
      name: 'photos',
      columns: [
        { name: 'survey_id', type: 'string', isIndexed: true },
        { name: 'slot', type: 'string' }, // front|inside|side|document
        { name: 'local_uri', type: 'string' }, // compressed file on device
        { name: 'server_key', type: 'string', isOptional: true },
        { name: 'size_kb', type: 'number' },
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'upload_state', type: 'string', isIndexed: true }, // pending|uploading|done|failed
        { name: 'upload_error', type: 'string', isOptional: true },
        { name: 'retry_count', type: 'number' },
        { name: 'captured_at', type: 'number' },
        { name: 'uploaded_at', type: 'number', isOptional: true },
      ],
    }),

    /* ────────────────────────── sync_queue ────────────────────────── */
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'kind', type: 'string', isIndexed: true }, // survey|photo|qc_remark
        { name: 'reference_id', type: 'string', isIndexed: true },
        { name: 'payload_json', type: 'string' },
        { name: 'state', type: 'string', isIndexed: true }, // pending|in_flight|failed|done
        { name: 'attempt_count', type: 'number' },
        { name: 'last_error', type: 'string', isOptional: true },
        { name: 'next_attempt_at', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    /* ────────────────────────── masters_cache ────────────────────────── */
    tableSchema({
      name: 'masters_cache',
      columns: [
        { name: 'cache_key', type: 'string', isIndexed: true }, // 'bundle'
        { name: 'version', type: 'string' },
        { name: 'payload_json', type: 'string' },
        { name: 'fetched_at', type: 'number' },
      ],
    }),
  ],
});
