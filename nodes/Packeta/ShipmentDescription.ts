import { INodeProperties } from 'n8n-workflow';

export const shipmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['shipment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new shipment from packet IDs',
				action: 'Create a shipment',
			},
			{
				name: 'Get Packets',
				value: 'getPackets',
				description: 'Get packets contained in a shipment',
				action: 'Get shipment packets',
			},
		],
		default: 'create',
	},
];

export const shipmentFields: INodeProperties[] = [
	// ==================== CREATE SHIPMENT ====================
	{
		displayName: 'Packet IDs',
		name: 'packetIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['shipment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Comma-separated list of packet IDs to include in the shipment',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['shipment'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Custom Barcode',
				name: 'customBarcode',
				type: 'string',
				default: '',
				description: 'Custom barcode for the shipment (only if enabled for your account)',
			},
		],
	},

	// ==================== GET SHIPMENT PACKETS ====================
	{
		displayName: 'Shipment ID',
		name: 'shipmentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['shipment'],
				operation: ['getPackets'],
			},
		},
		default: '',
		description: 'Shipment barcode (D-code or B-code, e.g., D-***-XM-12345678)',
	},
];
