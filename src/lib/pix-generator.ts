/**
 * Pix BRCode Generator following EMV QR Code specification
 * Implements CRC16-CCITT (0xFFFF) checksum algorithm
 */

// CRC16-CCITT (0xFFFF) polynomial table
const CRC16_TABLE = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
  0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
  0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
  0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
  0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
  0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
  0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
  0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
  0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
  0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
  0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
  0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
  0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
  0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
  0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
  0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
  0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
  0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
  0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
  0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
  0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
  0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
  0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
  0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
  0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0,
];

/**
 * Calculate CRC16-CCITT checksum
 */
export function calculateCRC16(payload: string): string {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:45',message:'calculateCRC16 entry',data:{payloadLength:payload.length,payloadEnd:payload.slice(-10)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  let crc = 0xffff;
  
  for (let i = 0; i < payload.length; i++) {
    const c = payload.charCodeAt(i);
    const j = ((crc >> 8) ^ c) & 0xff;
    crc = ((crc << 8) ^ CRC16_TABLE[j]) & 0xffff;
  }
  
  const result = crc.toString(16).toUpperCase().padStart(4, "0");
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:55',message:'calculateCRC16 exit',data:{crcValue:crc,crcHex:result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  return result;
}

/**
 * Format EMV TLV field: ID (2 chars) + Length (2 chars) + Value
 */
function formatTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  const tlv = `${id}${length}${value}`;
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:60',message:'TLV formatted',data:{id,valueLength:value.length,length,actualValueLength:value.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  return tlv;
}

/**
 * Remove special characters and normalize text for Pix payload
 */
function normalizeText(text: string, maxLength: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-zA-Z0-9 ]/g, "") // Keep only alphanumeric and spaces
    .substring(0, maxLength)
    .toUpperCase();
}

export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "evp" | "unknown";

/**
 * Detect Pix Key type
 */
export function detectPixKeyType(key: string): PixKeyType {
  const cleanKey = key.trim();
  
  // CPF: 11 digits
  if (/^\d{11}$/.test(cleanKey.replace(/\D/g, "")) && cleanKey.replace(/\D/g, "").length === 11) {
    const digits = cleanKey.replace(/\D/g, "");
    if (digits.length === 11 && !digits.split("").every((d) => d === digits[0])) {
      return "cpf";
    }
  }
  
  // CNPJ: 14 digits
  if (/^\d{14}$/.test(cleanKey.replace(/\D/g, "")) && cleanKey.replace(/\D/g, "").length === 14) {
    const digits = cleanKey.replace(/\D/g, "");
    if (digits.length === 14 && !digits.split("").every((d) => d === digits[0])) {
      return "cnpj";
    }
  }
  
  // Phone: +55 followed by DDD and number
  const phoneDigits = cleanKey.replace(/\D/g, "");
  if (/^\+?55\d{10,11}$/.test(cleanKey.replace(/\s/g, "")) || 
      (phoneDigits.length >= 10 && phoneDigits.length <= 13)) {
    return "phone";
  }
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanKey)) {
    return "email";
  }
  
  // EVP (Random Key): UUID format
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanKey)) {
    return "evp";
  }
  
  return "unknown";
}

/**
 * Format Pix Key according to its type
 */
function formatPixKey(key: string, type: PixKeyType): string {
  const cleanKey = key.trim();
  
  switch (type) {
    case "phone":
      // Format as +55XXXXXXXXXXX
      const phoneDigits = cleanKey.replace(/\D/g, "");
      if (phoneDigits.startsWith("55")) {
        return `+${phoneDigits}`;
      }
      return `+55${phoneDigits}`;
    
    case "cpf":
    case "cnpj":
      // Remove formatting, keep only digits
      return cleanKey.replace(/\D/g, "");
    
    case "email":
      return cleanKey.toLowerCase();
    
    case "evp":
      return cleanKey.toLowerCase();
    
    default:
      return cleanKey;
  }
}

export interface PixPayload {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txId?: string;
  description?: string;
}

/**
 * Generate Static Pix BRCode payload
 */
export function generatePixPayload(data: PixPayload): string {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:164',message:'generatePixPayload entry',data:{pixKey:data.pixKey,merchantName:data.merchantName,amount:data.amount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const keyType = detectPixKeyType(data.pixKey);
  const formattedKey = formatPixKey(data.pixKey, keyType);
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:167',message:'Key formatted',data:{keyType,formattedKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  // ID 00 - Payload Format Indicator
  const id00 = formatTLV("00", "01");
  
  // ID 26 - Merchant Account Information (Pix)
  const gui = formatTLV("00", "BR.GOV.BCB.PIX");
  const pixKey = formatTLV("01", formattedKey);
  
  // Optional description in merchant account
  let merchantAccountContent = gui + pixKey;
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:199',message:'Before description check',data:{hasDescription:!!data.description,descriptionValue:data.description,merchantAccountContentLength:merchantAccountContent.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  if (data.description) {
    const desc = normalizeText(data.description, 72);
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:202',message:'Description normalized',data:{original:data.description,normalized:desc,descLength:desc.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (desc) {
      merchantAccountContent += formatTLV("02", desc);
    }
  }
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:207',message:'Merchant account content final',data:{merchantAccountContent,merchantAccountContentLength:merchantAccountContent.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const id26 = formatTLV("26", merchantAccountContent);
  
  // ID 52 - Merchant Category Code
  const id52 = formatTLV("52", "0000");
  
  // ID 53 - Transaction Currency (986 = BRL)
  const id53 = formatTLV("53", "986");
  
  // ID 54 - Transaction Amount (optional for static QR)
  let id54 = "";
  if (data.amount && data.amount > 0) {
    const amountStr = data.amount.toFixed(2);
    id54 = formatTLV("54", amountStr);
  }
  
  // ID 58 - Country Code
  const id58 = formatTLV("58", "BR");
  
  // ID 59 - Merchant Name
  const merchantName = normalizeText(data.merchantName, 25);
  const id59 = formatTLV("59", merchantName || "RECEBEDOR");
  
  // ID 60 - Merchant City
  const merchantCity = normalizeText(data.merchantCity, 15);
  const id60 = formatTLV("60", merchantCity || "SAO PAULO");
  
  // ID 62 - Additional Data Field Template
  const txId = data.txId ? normalizeText(data.txId, 25) : "***";
  const additionalData = formatTLV("05", txId);
  const id62 = formatTLV("62", additionalData);
  
  // Build payload without CRC
  const payloadWithoutCRC = id00 + id26 + id52 + id53 + id54 + id58 + id59 + id60 + id62;
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:215',message:'Payload without CRC',data:{payloadWithoutCRC,length:payloadWithoutCRC.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  // ID 63 - CRC16 (placeholder with 4 chars for CRC calculation)
  const payloadForCRC = payloadWithoutCRC + "6304";
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:218',message:'Payload for CRC calculation',data:{payloadForCRC,length:payloadForCRC.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Calculate CRC16
  const crc = calculateCRC16(payloadForCRC);
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:221',message:'CRC calculated',data:{crc},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Final payload with CRC - ID 63 (CRC16) format: "63" + "04" (length) + CRC (4 chars)
  const finalPayload = payloadWithoutCRC + "6304" + crc;
  
  // Validate CRC: recalculate on final payload (without the CRC value) to verify
  const payloadForValidation = payloadWithoutCRC + "6304";
  const recalculatedCRC = calculateCRC16(payloadForValidation);
  const crcMatches = recalculatedCRC === crc;
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/0a1ba152-998c-490b-9ad2-83cf911cb85a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pix-generator.ts:261',message:'Final payload',data:{finalPayload,length:finalPayload.length,endsWithCRC:finalPayload.endsWith(crc),hasId63:finalPayload.includes('6304'),endsWithId63CRC:finalPayload.endsWith('04' + crc),finalSegment:finalPayload.slice(-8),crcMatches,recalculatedCRC,originalCRC:crc,payloadForValidation},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  return finalPayload;
}

/**
 * Validate if Pix Key is valid
 */
export function isValidPixKey(key: string): boolean {
  const type = detectPixKeyType(key);
  return type !== "unknown" && key.trim().length > 0;
}

/**
 * Get human-readable key type label in Portuguese
 */
export function getKeyTypeLabel(type: PixKeyType): string {
  const labels: Record<PixKeyType, string> = {
    cpf: "CPF",
    cnpj: "CNPJ",
    email: "E-mail",
    phone: "Telefone",
    evp: "Chave Aleatória",
    unknown: "Desconhecido",
  };
  return labels[type];
}
