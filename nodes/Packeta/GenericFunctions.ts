import {
	IExecuteFunctions,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

/**
 * Make a request to the Packeta XML REST API
 */
export async function packetaApiRequest(
	this: IExecuteFunctions,
	xmlBody: string,
): Promise<string> {
	const credentials = await this.getCredentials('packetaApi');
	const apiUrl = credentials.apiUrl as string;
	const apiPassword = credentials.apiPassword as string;

	// Replace placeholder with actual API password
	const body = '<?xml version="1.0" encoding="utf-8"?>' + xmlBody.replace('{{apiPassword}}', apiPassword);

	const options: IHttpRequestOptions = {
		method: 'POST' as IHttpRequestMethods,
		url: apiUrl,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
		body,
		returnFullResponse: false,
	};

	try {
		const response = await this.helpers.httpRequest(options);
		
		// Check for error response
		if (typeof response === 'string' && response.includes('<status>fault</status>')) {
			const errorInfo = parsePacketaError(response);
			throw new Error(errorInfo);
		}

		return response as string;
	} catch (error) {
		throw new NodeApiError(this.getNode(), { message: (error as Error).message } as JsonObject);
	}
}

/**
 * Parse Packeta API error response and return detailed error message
 */
function parsePacketaError(xmlResponse: string): string {
	const lines: string[] = [];
	
	// Get main fault type
	const faultMatch = xmlResponse.match(/<fault>([^<]+)<\/fault>/);
	const faultType = faultMatch ? faultMatch[1] : 'UnknownFault';
	lines.push(`Packeta API Error: ${faultType}`);
	
	// Get error string/description
	const stringMatch = xmlResponse.match(/<string>([^<]+)<\/string>/);
	if (stringMatch) {
		lines.push(`Description: ${stringMatch[1]}`);
	}
	
	// Parse detail section
	const detailMatch = xmlResponse.match(/<detail>([\s\S]*?)<\/detail>/);
	if (detailMatch && detailMatch[1].trim()) {
		const detail = detailMatch[1];
		
		// Parse attributes with faults (PacketAttributesFault structure)
		const attributeFaults: string[] = [];
		
		// Match nested fault elements with name and fault text
		// Structure: <fault><name>fieldName</name><fault>error message</fault></fault>
		const faultBlocks = detail.match(/<fault>[\s\S]*?<name>[\s\S]*?<\/name>[\s\S]*?<fault>[\s\S]*?<\/fault>[\s\S]*?<\/fault>/g);
		if (faultBlocks) {
			for (const block of faultBlocks) {
				const nameMatch = block.match(/<name>([^<]+)<\/name>/);
				const innerFaultMatch = block.match(/<fault>([^<]+)<\/fault>/g);
				if (nameMatch && innerFaultMatch) {
					// Get the last fault (inner one with actual message)
					const lastFault = innerFaultMatch[innerFaultMatch.length - 1];
					const msgMatch = lastFault.match(/<fault>([^<]+)<\/fault>/);
					if (msgMatch) {
						attributeFaults.push(`  - ${nameMatch[1]}: ${msgMatch[1]}`);
					}
				}
			}
		}
		
		// If no structured faults found, try to extract any fault messages
		if (attributeFaults.length === 0) {
			const allFaults = detail.match(/<fault>([^<]+)<\/fault>/g);
			if (allFaults) {
				for (const f of allFaults) {
					const m = f.match(/<fault>([^<]+)<\/fault>/);
					if (m && m[1] !== faultType) {
						attributeFaults.push(`  - ${m[1]}`);
					}
				}
			}
		}
		
		if (attributeFaults.length > 0) {
			lines.push('Field errors:');
			lines.push(...attributeFaults);
		}
	}
	
	return lines.join('\n');
}

/**
 * Build XML request body
 */
export function buildXmlRequest(method: string, params: IDataObject): string {
	const xmlParts: string[] = [];
	xmlParts.push(`<${method}>`);
	
	for (const [key, value] of Object.entries(params)) {
		xmlParts.push(objectToXml(key, value));
	}
	
	xmlParts.push(`</${method}>`);
	return xmlParts.join('');
}

/**
 * Convert object to XML string
 */
function objectToXml(key: string, value: unknown): string {
	if (value === null || value === undefined) {
		return '';
	}

	if (Array.isArray(value)) {
		return value.map(item => objectToXml(key, item)).join('');
	}

	if (typeof value === 'object') {
		const obj = value as IDataObject;
		let xml = `<${key}>`;
		for (const [subKey, subValue] of Object.entries(obj)) {
			xml += objectToXml(subKey, subValue);
		}
		xml += `</${key}>`;
		return xml;
	}

	return `<${key}>${escapeXml(String(value))}</${key}>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Parse XML response
 */
export function parseXmlResponse(xmlString: string, _resultType: string): IDataObject {
	const result: IDataObject = {};
	
	// Check status
	const statusMatch = xmlString.match(/<status>([^<]+)<\/status>/);
	if (statusMatch) {
		result.status = statusMatch[1];
	}

	// Extract result content
	const resultMatch = xmlString.match(/<result>([\s\S]*?)<\/result>/);
	if (resultMatch) {
		const resultContent = resultMatch[1];
		
		// Parse common fields
		const fields = [
			'id', 'barcode', 'barcodeText', 'password',
			'branchId', 'invoicedWeightGrams', 'number',
			'dateTime', 'statusCode', 'codeText', 'statusText',
			'isReturning', 'storedUntil', 'carrierId', 'carrierName',
			'courierNumber', 'date'
		];

		for (const field of fields) {
			const fieldMatch = resultContent.match(new RegExp(`<${field}>([^<]*)</${field}>`));
			if (fieldMatch) {
				result[field] = parseValue(fieldMatch[1]);
			}
		}

		// Parse courier info array
		const courierInfoMatch = resultContent.match(/<courierInfo>([\s\S]*?)<\/courierInfo>/);
		if (courierInfoMatch) {
			result.courierInfo = parseCourierInfo(courierInfoMatch[1]);
		}

		// Parse status records array
		const recordMatches = resultContent.match(/<record>([\s\S]*?)<\/record>/g);
		if (recordMatches) {
			result.records = recordMatches.map(parseStatusRecord);
		}

		// Parse packets array
		const packetMatches = resultContent.match(/<packet>([\s\S]*?)<\/packet>/g);
		if (packetMatches) {
			result.packets = packetMatches.map(parsePacket);
		}

		// Check for binary data (base64)
		if (resultContent.length > 100 && !resultContent.includes('<')) {
			result.data = resultContent.trim();
		}
	}

	// Handle response without <result> wrapper (like binary responses)
	if (!resultMatch) {
		// Check if it's just base64 data
		const base64Match = xmlString.match(/<response>([^<]+)<\/response>/);
		if (base64Match) {
			result.data = base64Match[1].trim();
		}
	}

	return result;
}

function parseValue(value: string): string | number | boolean {
	// Try to parse as number
	if (/^\d+$/.test(value)) {
		return parseInt(value, 10);
	}
	if (/^\d+\.\d+$/.test(value)) {
		return parseFloat(value);
	}
	// Parse booleans
	if (value === 'true' || value === '1') return true;
	if (value === 'false' || value === '0') return false;
	
	return value;
}

function parseCourierInfo(xml: string): IDataObject[] {
	const items: IDataObject[] = [];
	const itemMatches = xml.match(/<courierInfoItem>([\s\S]*?)<\/courierInfoItem>/g);
	
	if (itemMatches) {
		for (const itemXml of itemMatches) {
			const item: IDataObject = {};
			const fields = ['courierId', 'courierName'];
			
			for (const field of fields) {
				const match = itemXml.match(new RegExp(`<${field}>([^<]*)</${field}>`));
				if (match) item[field] = parseValue(match[1]);
			}

			// Parse courier numbers
			const numbersMatch = itemXml.match(/<courierNumbers>([\s\S]*?)<\/courierNumbers>/);
			if (numbersMatch) {
				const numbers = numbersMatch[1].match(/<courierNumber>([^<]+)<\/courierNumber>/g);
				if (numbers) {
					item.courierNumbers = numbers.map(n => {
						const m = n.match(/<courierNumber>([^<]+)<\/courierNumber>/);
						return m ? m[1] : '';
					});
				}
			}

			// Parse tracking URLs
			const urlsMatch = itemXml.match(/<courierTrackingUrls>([\s\S]*?)<\/courierTrackingUrls>/);
			if (urlsMatch) {
				const urlItems = urlsMatch[1].match(/<courierTrackingUrl>([\s\S]*?)<\/courierTrackingUrl>/g);
				if (urlItems) {
					item.trackingUrls = urlItems.map(urlXml => {
						const url: IDataObject = {};
						const langMatch = urlXml.match(/<lang>([^<]+)<\/lang>/);
						const urlMatch = urlXml.match(/<url>([^<]+)<\/url>/);
						if (langMatch) url.lang = langMatch[1];
						if (urlMatch) url.url = urlMatch[1];
						return url;
					});
				}
			}

			items.push(item);
		}
	}
	
	return items;
}

function parseStatusRecord(xml: string): IDataObject {
	const record: IDataObject = {};
	const fields = [
		'dateTime', 'statusCode', 'codeText', 'statusText',
		'branchId', 'destinationBranchId', 'externalTrackingCode',
		'isReturning', 'storedUntil', 'carrierId', 'carrierName',
		'carrierClass', 'externalStatusName', 'externalNote'
	];

	for (const field of fields) {
		const match = xml.match(new RegExp(`<${field}>([^<]*)</${field}>`));
		if (match) record[field] = parseValue(match[1]);
	}

	return record;
}

function parsePacket(xml: string): IDataObject {
	const packet: IDataObject = {};
	const fields = ['id', 'barcode', 'barcodeText'];

	for (const field of fields) {
		const match = xml.match(new RegExp(`<${field}>([^<]*)</${field}>`));
		if (match) packet[field] = parseValue(match[1]);
	}

	return packet;
}

/**
 * Build packet attributes from node parameters
 */
export async function buildPacketAttributes(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const credentials = await this.getCredentials('packetaApi');
	
	// Get eshop from parameter or fall back to credentials default sender
	let eshop = this.getNodeParameter('eshop', itemIndex, '') as string;
	if (!eshop && credentials.senderName) {
		eshop = credentials.senderName as string;
	}

	const attributes: IDataObject = {
		number: this.getNodeParameter('number', itemIndex) as string,
		name: this.getNodeParameter('name', itemIndex) as string,
		surname: this.getNodeParameter('surname', itemIndex) as string,
		addressId: this.getNodeParameter('addressId', itemIndex) as number,
		value: this.getNodeParameter('value', itemIndex) as number,
		weight: this.getNodeParameter('weight', itemIndex) as number,
	};

	// Only add eshop if provided (required when using multiple senders)
	if (eshop) {
		attributes.eshop = eshop;
	}

	// Email or phone required
	const email = this.getNodeParameter('email', itemIndex, '') as string;
	const phone = this.getNodeParameter('phone', itemIndex, '') as string;

	if (email) attributes.email = email;
	if (phone) attributes.phone = phone;

	// Additional optional fields
	const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

	if (additionalFields.company) attributes.company = additionalFields.company;
	if (additionalFields.currency) attributes.currency = additionalFields.currency;
	if (additionalFields.cod) attributes.cod = additionalFields.cod;
	if (additionalFields.note) attributes.note = additionalFields.note;
	if (additionalFields.adultContent) attributes.adultContent = additionalFields.adultContent ? 1 : 0;
	if (additionalFields.deliverOn) attributes.deliverOn = additionalFields.deliverOn;
	if (additionalFields.carrierService) attributes.carrierService = additionalFields.carrierService;
	if (additionalFields.customerBarcode) attributes.customerBarcode = additionalFields.customerBarcode;
	if (additionalFields.carrierPickupPoint) attributes.carrierPickupPoint = additionalFields.carrierPickupPoint;

	// Home delivery address fields
	if (additionalFields.street) attributes.street = additionalFields.street;
	if (additionalFields.houseNumber) attributes.houseNumber = additionalFields.houseNumber;
	if (additionalFields.city) attributes.city = additionalFields.city;
	if (additionalFields.zip) attributes.zip = additionalFields.zip;
	if (additionalFields.province) attributes.province = additionalFields.province;

	// Size (for carriers that require it)
	if (additionalFields.sizeLength || additionalFields.sizeWidth || additionalFields.sizeHeight) {
		attributes.size = {
			length: additionalFields.sizeLength || 0,
			width: additionalFields.sizeWidth || 0,
			height: additionalFields.sizeHeight || 0,
		};
	}

	return attributes;
}
