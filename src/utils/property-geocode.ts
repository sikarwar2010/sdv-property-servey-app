/** Fields from the address step used to build a forward-geocoding query (India). */
export type PropertyAddressForMap = {
  houseNo: string;
  streetName: string;
  locality: string;
  colony: string;
  city: string;
  pinCode: string;
  wardNo?: string;
  ulbName?: string;
};

/**
 * Builds a single-line address for `Location.geocodeAsync` (Google on Android / Apple on iOS).
 * Requires 6-digit PIN and city so results are usable for property surveys.
 */
export function surveyDraftToAddressContext(d: {
  houseNo: string;
  streetName: string;
  locality: string;
  colony: string;
  city: string;
  pinCode: string;
  wardNo: string;
  ulbName: string;
}): PropertyAddressForMap {
  return {
    houseNo: d.houseNo,
    streetName: d.streetName,
    locality: d.locality,
    colony: d.colony,
    city: d.city,
    pinCode: d.pinCode,
    wardNo: d.wardNo,
    ulbName: d.ulbName,
  };
}

export function buildPropertyGeocodeQuery(a: PropertyAddressForMap): string | null {
  const city = a.city?.trim();
  const pin = a.pinCode?.trim();
  if (!city || pin.length !== 6 || !/^\d{6}$/.test(pin)) return null;

  const house = a.houseNo?.trim();
  const street = a.streetName?.trim();
  const locality = a.locality?.trim();
  const colony = a.colony?.trim();
  const ward = a.wardNo?.trim();
  const ulb = a.ulbName?.trim();

  const line1 = [house && `H.No ${house}`, street].filter(Boolean).join(', ');
  const line2 = [locality, colony].filter(Boolean).join(', ');
  const meta = [ward && `Ward ${ward}`, ulb].filter(Boolean).join(' · ');

  const parts = [line1, line2, meta, `${city} ${pin}`, 'India'].filter(Boolean);
  return parts.join(', ');
}
