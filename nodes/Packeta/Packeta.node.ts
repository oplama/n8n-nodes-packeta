import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { packetOperations, packetFields } from './PacketDescription.js';
import { labelOperations, labelFields } from './LabelDescription.js';
import { shipmentOperations, shipmentFields } from './ShipmentDescription.js';
import { trackingOperations, trackingFields } from './TrackingDescription.js';
import { packetaApiRequest, buildXmlRequest, parseXmlResponse, buildPacketAttributes } from './GenericFunctions.js';

export class Packeta implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Packeta',
		name: 'packeta',
		icon: 'file:packeta.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Packeta (Zásilkovna) API',
		defaults: {
			name: 'Packeta',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'packetaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Packet',
						value: 'packet',
						description: 'Create, validate, cancel and manage packets',
					},
					{
						name: 'Label',
						value: 'label',
						description: 'Generate labels for packets',
					},
					{
						name: 'Shipment',
						value: 'shipment',
						description: 'Create and manage shipments',
					},
					{
						name: 'Tracking',
						value: 'tracking',
						description: 'Track packet status and history',
					},
				],
				default: 'packet',
			},
			// Packet operations
			...packetOperations,
			...packetFields,
			// Label operations
			...labelOperations,
			...labelFields,
			// Shipment operations
			...shipmentOperations,
			...shipmentFields,
			// Tracking operations
			...trackingOperations,
			...trackingFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject = {};

				// ==================== PACKET OPERATIONS ====================
				if (resource === 'packet') {
					// Create Packet
					if (operation === 'create') {
						const packetAttributes = await buildPacketAttributes.call(this, i);
						const xmlBody = buildXmlRequest('createPacket', {
							apiPassword: '{{apiPassword}}',
							packetAttributes,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'PacketIdDetail');
					}

					// Validate Packet Attributes
					else if (operation === 'validate') {
						const packetAttributes = await buildPacketAttributes.call(this, i);
						const xmlBody = buildXmlRequest('packetAttributesValid', {
							apiPassword: '{{apiPassword}}',
							packetAttributes,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'validation');
						responseData.valid = true;
						responseData.message = 'Packet attributes are valid';
					}

					// Cancel Packet
					else if (operation === 'cancel') {
						const packetId = this.getNodeParameter('packetId', i) as string;
						const xmlBody = buildXmlRequest('cancelPacket', {
							apiPassword: '{{apiPassword}}',
							packetId,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'cancelPacket');
						responseData.success = true;
						responseData.packetId = packetId;
					}

					// Get Packet Info
					else if (operation === 'getInfo') {
						const packetId = this.getNodeParameter('packetId', i) as string;
						const xmlBody = buildXmlRequest('packetInfo', {
							apiPassword: '{{apiPassword}}',
							packetId,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'PacketInfoResult');
					}

					// Get Stored Until Date
					else if (operation === 'getStoredUntil') {
						const packetId = this.getNodeParameter('packetId', i) as string;
						const xmlBody = buildXmlRequest('packetGetStoredUntil', {
							apiPassword: '{{apiPassword}}',
							packetId,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'NullableDate');
					}

					// Set Stored Until Date
					else if (operation === 'setStoredUntil') {
						const packetId = this.getNodeParameter('packetId', i) as string;
						const date = this.getNodeParameter('date', i) as string;
						const xmlBody = buildXmlRequest('packetSetStoredUntil', {
							apiPassword: '{{apiPassword}}',
							packetId,
							date,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'setStoredUntil');
						responseData.success = true;
					}

					// Create Packet Claim
					else if (operation === 'createClaim') {
						const claimAttributes: IDataObject = {
							number: this.getNodeParameter('number', i) as string,
							email: this.getNodeParameter('email', i) as string,
							value: this.getNodeParameter('value', i) as number,
							eshop: this.getNodeParameter('eshop', i) as string,
						};

						const optionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						if (optionalFields.phone) claimAttributes.phone = optionalFields.phone;
						if (optionalFields.currency) claimAttributes.currency = optionalFields.currency;
						if (optionalFields.sendLabelToEmail) claimAttributes.sendLabelToEmail = optionalFields.sendLabelToEmail;

						const xmlBody = buildXmlRequest('createPacketClaim', {
							apiPassword: '{{apiPassword}}',
							claimAttributes,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'PacketIdDetail');
					}

					// Get Courier Number
					else if (operation === 'getCourierNumber') {
						const packetId = this.getNodeParameter('packetId', i) as string;
						const xmlBody = buildXmlRequest('packetCourierNumberV2', {
							apiPassword: '{{apiPassword}}',
							packetId,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'PacketCourierNumberV2Result');
					}
				}

				// ==================== LABEL OPERATIONS ====================
				else if (resource === 'label') {
					// Get Label PDF
					if (operation === 'getPdf') {
						const packetId = this.getNodeParameter('packetId', i) as string;
						const format = this.getNodeParameter('format', i) as string;
						const offset = this.getNodeParameter('offset', i, 0) as number;

						const xmlBody = buildXmlRequest('packetLabelPdf', {
							apiPassword: '{{apiPassword}}',
							packetId,
							format,
							offset,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						const parsed = parseXmlResponse(response, 'binary');

						// Return as binary data
						const binaryData = await this.helpers.prepareBinaryData(
							Buffer.from(parsed.data as string, 'base64'),
							`label_${packetId}.pdf`,
							'application/pdf',
						);

						returnData.push({
							json: { packetId, format },
							binary: { data: binaryData },
						});
						continue;
					}

					// Get Label ZPL
					else if (operation === 'getZpl') {
						const packetId = this.getNodeParameter('packetId', i) as string;
						const dpi = this.getNodeParameter('dpi', i, 300) as number;

						const xmlBody = buildXmlRequest('packetLabelZpl', {
							apiPassword: '{{apiPassword}}',
							packetId,
							dpi,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'string');
						responseData.packetId = packetId;
					}

					// Get Multiple Labels PDF
					else if (operation === 'getMultiplePdf') {
						const packetIds = (this.getNodeParameter('packetIds', i) as string).split(',').map(id => id.trim());
						const format = this.getNodeParameter('format', i) as string;
						const offset = this.getNodeParameter('offset', i, 0) as number;

						const xmlBody = buildXmlRequest('packetsLabelsPdf', {
							apiPassword: '{{apiPassword}}',
							packetIds: { id: packetIds },
							format,
							offset,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						const parsed = parseXmlResponse(response, 'binary');

						const binaryData = await this.helpers.prepareBinaryData(
							Buffer.from(parsed.data as string, 'base64'),
							`labels_batch.pdf`,
							'application/pdf',
						);

						returnData.push({
							json: { packetIds, format },
							binary: { data: binaryData },
						});
						continue;
					}

					// Get Courier Label PDF
					else if (operation === 'getCourierLabelPdf') {
						const packetId = this.getNodeParameter('packetId', i) as string;
						const courierNumber = this.getNodeParameter('courierNumber', i) as string;

						const xmlBody = buildXmlRequest('packetCourierLabelPdf', {
							apiPassword: '{{apiPassword}}',
							packetId,
							courierNumber,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						const parsed = parseXmlResponse(response, 'binary');

						const binaryData = await this.helpers.prepareBinaryData(
							Buffer.from(parsed.data as string, 'base64'),
							`courier_label_${packetId}.pdf`,
							'application/pdf',
						);

						returnData.push({
							json: { packetId, courierNumber },
							binary: { data: binaryData },
						});
						continue;
					}

					// Get Barcode PNG
					else if (operation === 'getBarcode') {
						const barcode = this.getNodeParameter('barcode', i) as string;

						const xmlBody = buildXmlRequest('barcodePng', {
							apiPassword: '{{apiPassword}}',
							barcode,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						const parsed = parseXmlResponse(response, 'binary');

						const binaryData = await this.helpers.prepareBinaryData(
							Buffer.from(parsed.data as string, 'base64'),
							`barcode_${barcode}.png`,
							'image/png',
						);

						returnData.push({
							json: { barcode },
							binary: { data: binaryData },
						});
						continue;
					}
				}

				// ==================== SHIPMENT OPERATIONS ====================
				else if (resource === 'shipment') {
					// Create Shipment
					if (operation === 'create') {
						const packetIds = (this.getNodeParameter('packetIds', i) as string).split(',').map(id => id.trim());
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const params: IDataObject = {
							apiPassword: '{{apiPassword}}',
							packetIds: { id: packetIds },
						};

						if (additionalFields.customBarcode) {
							params.customBarcode = additionalFields.customBarcode;
						}

						const xmlBody = buildXmlRequest('createShipment', params);
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'ShipmentIdDetail');
					}

					// Get Shipment Packets
					else if (operation === 'getPackets') {
						const shipmentId = this.getNodeParameter('shipmentId', i) as string;

						const xmlBody = buildXmlRequest('shipmentPackets', {
							apiPassword: '{{apiPassword}}',
							shipmentId,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'ShipmentPacketsResult');
					}
				}

				// ==================== TRACKING OPERATIONS ====================
				else if (resource === 'tracking') {
					// Get Packet Status
					if (operation === 'getStatus') {
						const packetId = this.getNodeParameter('packetId', i) as string;

						const xmlBody = buildXmlRequest('packetStatus', {
							apiPassword: '{{apiPassword}}',
							packetId,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'CurrentStatusRecord');
					}

					// Get Tracking History
					else if (operation === 'getHistory') {
						const packetId = this.getNodeParameter('packetId', i) as string;

						const xmlBody = buildXmlRequest('packetTracking', {
							apiPassword: '{{apiPassword}}',
							packetId,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'StatusRecords');
					}

					// Get Courier Tracking
					else if (operation === 'getCourierTracking') {
						const packetId = this.getNodeParameter('packetId', i) as string;

						const xmlBody = buildXmlRequest('packetCourierTracking', {
							apiPassword: '{{apiPassword}}',
							packetId,
						});
						const response = await packetaApiRequest.call(this, xmlBody);
						responseData = parseXmlResponse(response, 'ExternalStatusRecords');
					}
				}

				returnData.push({ json: responseData });

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
