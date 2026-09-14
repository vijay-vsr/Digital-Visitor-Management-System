/**
 * Generates a unique, professional Visitor ID
 * Format: VMS-YYYYMMDD-XXXX (e.g. VMS-20260914-8842)
 */
function generateVisitorId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `VMS-${year}${month}${day}-${randomSuffix}`;
}

module.exports = { generateVisitorId };
