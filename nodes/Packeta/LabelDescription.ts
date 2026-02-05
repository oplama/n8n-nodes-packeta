import { INodeProperties } from 'n8n-workflow';

export const labelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['label'],
			},
		},
		options: [
			{
				name: 'Get Barcode PNG',
				value: 'getBarcode',
				description: 'Generate a barcode image (Code 128)',
				action: 'Get barcode PNG',
			},
			{
				name: 'Get Courier Label PDF',
				value: 'getCourierLabelPdf',
				description: 'Get the external courier label as PDF',
				action: 'Get courier label PDF',
			},
			{
				name: 'Get Multiple Labels PDF',
				value: 'getMultiplePdf',
				description: 'Get labels for multiple packets as single PDF',
				action: 'Get multiple labels PDF',
			},
			{
				name: 'Get PDF',
				value: 'getPdf',
				description: 'Get a label as PDF for a single packet',
				action: 'Get label PDF',
			},
			{
				name: 'Get ZPL',
				value: 'getZpl',
				description: 'Get a label in ZPL format for thermal printers',
				action: 'Get label ZPL',
			},
		],
		default: 'getPdf',
	},
];

export const labelFields: INodeProperties[] = [
	// ==================== SINGLE LABEL PDF ====================
	{
		displayName: 'Packet ID',
		name: 'packetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['getPdf', 'getZpl', 'getCourierLabelPdf'],
			},
		},
		default: '',
		description: 'The unique packet ID',
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['getPdf', 'getMultiplePdf'],
			},
		},
		options: [
			{
				name: 'A6 on A6',
				value: 'A6 on A6',
				description: '105x148mm label on page of same size',
			},
			{
				name: 'A6 on A4',
				value: 'A6 on A4',
				description: '105x148mm label on A4 page',
			},
			{
				name: 'A7 on A7',
				value: 'A7 on A7',
				description: '105x74mm label on page of same size',
			},
			{
				name: 'A7 on A4',
				value: 'A7 on A4',
				description: '105x74mm label on A4 page',
			},
			{
				name: 'A8 on A8',
				value: 'A8 on A8',
				description: '50x74mm label on page of same size',
			},
			{
				name: '105x35mm on A4',
				value: '105x35mm on A4',
				description: '105x35mm label on A4 page',
			},
		],
		default: 'A6 on A6',
		description: 'Label format',
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['getPdf', 'getMultiplePdf'],
			},
		},
		default: 0,
		description: 'Position offset on page (starts at 0, top-left)',
	},

	// ==================== ZPL LABEL ====================
	{
		displayName: 'DPI',
		name: 'dpi',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['getZpl'],
			},
		},
		options: [
			{
				name: '203 DPI',
				value: 203,
			},
			{
				name: '300 DPI',
				value: 300,
			},
		],
		default: 300,
		description: 'DPI for ZPL label',
	},

	// ==================== MULTIPLE LABELS PDF ====================
	{
		displayName: 'Packet IDs',
		name: 'packetIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['getMultiplePdf'],
			},
		},
		default: '',
		description: 'Comma-separated list of packet IDs',
	},

	// ==================== COURIER LABEL ====================
	{
		displayName: 'Courier Number',
		name: 'courierNumber',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['getCourierLabelPdf'],
			},
		},
		default: '',
		description: 'The courier number (from packetCourierNumber)',
	},

	// ==================== BARCODE ====================
	{
		displayName: 'Barcode',
		name: 'barcode',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['getBarcode'],
			},
		},
		default: '',
		description: 'Barcode text (use packet ID prefixed with Z, e.g., Z1234567890)',
	},
];
