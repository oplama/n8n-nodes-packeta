import { INodeProperties } from 'n8n-workflow';

export const packetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['packet'],
			},
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a packet that has not been physically submitted',
				action: 'Cancel a packet',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new packet',
				action: 'Create a packet',
			},
			{
				name: 'Create Claim',
				value: 'createClaim',
				description: 'Create a claim assistant packet for returns',
				action: 'Create a claim packet',
			},
			{
				name: 'Get Courier Number',
				value: 'getCourierNumber',
				description: 'Get the external courier number for a packet',
				action: 'Get courier number',
			},
			{
				name: 'Get Info',
				value: 'getInfo',
				description: 'Get additional information about a packet',
				action: 'Get packet info',
			},
			{
				name: 'Get Stored Until',
				value: 'getStoredUntil',
				description: 'Get the date until which the packet is stored',
				action: 'Get stored until date',
			},
			{
				name: 'Set Stored Until',
				value: 'setStoredUntil',
				description: 'Set the date until which the packet should be stored',
				action: 'Set stored until date',
			},
			{
				name: 'Validate',
				value: 'validate',
				description: 'Validate packet attributes without creating the packet',
				action: 'Validate packet attributes',
			},
		],
		default: 'create',
	},
];

export const packetFields: INodeProperties[] = [
	// ==================== CREATE / VALIDATE PACKET FIELDS ====================
	{
		displayName: 'Order Number',
		name: 'number',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate', 'createClaim'],
			},
		},
		default: '',
		description: 'Unique order ID from your e-shop (1-36 alphanumeric characters)',
	},
	{
		displayName: 'First Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate'],
			},
		},
		default: '',
		description: "Recipient's first name",
	},
	{
		displayName: 'Surname',
		name: 'surname',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate'],
			},
		},
		default: '',
		description: "Recipient's surname",
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate', 'createClaim'],
			},
		},
		default: '',
		description: "Recipient's email address (required if no phone is provided)",
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate'],
			},
		},
		default: '',
		description: "Recipient's phone number with country code (required if no email is provided)",
	},
	{
		displayName: 'Address ID',
		name: 'addressId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate'],
			},
		},
		default: 0,
		description: 'Branch ID or external carrier ID. Get this from the Packeta widget or carrier list.',
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate', 'createClaim'],
			},
		},
		default: 0,
		description: 'Packet value for insurance purposes',
	},
	{
		displayName: 'Weight (kg)',
		name: 'weight',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate'],
			},
		},
		default: 0,
		description: 'Weight in kilograms',
	},
	{
		displayName: 'E-Shop / Sender',
		name: 'eshop',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate', 'createClaim'],
			},
		},
		default: '',
		description: 'Sender indication. If not specified, uses the default sender from credentials. Required when using multiple senders.',
	},

	// ==================== ADDITIONAL FIELDS (CREATE/VALIDATE) ====================
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['create', 'validate'],
			},
		},
		options: [
			{
				displayName: 'Adult Content',
				name: 'adultContent',
				type: 'boolean',
				default: false,
				description: 'Whether the packet should only be handed to persons over 18 years (CZ/SK/HU/RO only)',
			},
			{
				displayName: 'COD (Cash on Delivery)',
				name: 'cod',
				type: 'number',
				default: 0,
				description: 'Cash on delivery amount (up to 2 decimal places)',
			},
			{
				displayName: 'Carrier Pickup Point',
				name: 'carrierPickupPoint',
				type: 'string',
				default: '',
				description: 'Code of carrier pickup point (required for some carriers)',
			},
			{
				displayName: 'Carrier Service',
				name: 'carrierService',
				type: 'string',
				default: '',
				description: 'Additional carrier services, comma separated',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City (required for home delivery)',
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: "Recipient's company name",
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'options',
				options: [
					{ name: 'CZK', value: 'CZK' },
					{ name: 'EUR', value: 'EUR' },
					{ name: 'HUF', value: 'HUF' },
					{ name: 'PLN', value: 'PLN' },
					{ name: 'RON', value: 'RON' },
				],
				default: 'CZK',
				description: 'Currency for COD and value',
			},
			{
				displayName: 'Custom Barcode',
				name: 'customerBarcode',
				type: 'string',
				default: '',
				description: 'Custom barcode (only if enabled for your account)',
			},
			{
				displayName: 'Deliver On',
				name: 'deliverOn',
				type: 'string',
				default: '',
				description: 'Scheduled delivery date (YYYY-MM-DD, within next 14 days)',
			},
			{
				displayName: 'House Number',
				name: 'houseNumber',
				type: 'string',
				default: '',
				description: 'House number (required for home delivery)',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				description: 'Sender note (max 128 characters, will appear on label)',
			},
			{
				displayName: 'Province',
				name: 'province',
				type: 'string',
				default: '',
				description: 'Province/State',
			},
			{
				displayName: 'Size - Height (mm)',
				name: 'sizeHeight',
				type: 'number',
				default: 0,
				description: 'Packet height in millimeters (required for some carriers)',
			},
			{
				displayName: 'Size - Length (mm)',
				name: 'sizeLength',
				type: 'number',
				default: 0,
				description: 'Packet length in millimeters (required for some carriers)',
			},
			{
				displayName: 'Size - Width (mm)',
				name: 'sizeWidth',
				type: 'number',
				default: 0,
				description: 'Packet width in millimeters (required for some carriers)',
			},
			{
				displayName: 'Street',
				name: 'street',
				type: 'string',
				default: '',
				description: 'Street (required for home delivery)',
			},
			{
				displayName: 'ZIP Code',
				name: 'zip',
				type: 'string',
				default: '',
				description: 'ZIP/Postal code (required for home delivery)',
			},
		],
	},

	// ==================== CANCEL / INFO / COURIER NUMBER ====================
	{
		displayName: 'Packet ID',
		name: 'packetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['cancel', 'getInfo', 'getStoredUntil', 'setStoredUntil', 'getCourierNumber'],
			},
		},
		default: '',
		description: 'The unique packet ID (10 digits)',
	},

	// ==================== SET STORED UNTIL ====================
	{
		displayName: 'Date',
		name: 'date',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['setStoredUntil'],
			},
		},
		default: '',
		description: 'The date until which the packet should be stored (YYYY-MM-DD)',
	},

	// ==================== CREATE CLAIM ADDITIONAL FIELDS ====================
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['packet'],
				operation: ['createClaim'],
			},
		},
		options: [
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'options',
				options: [
					{ name: 'CZK', value: 'CZK' },
					{ name: 'EUR', value: 'EUR' },
					{ name: 'HUF', value: 'HUF' },
					{ name: 'PLN', value: 'PLN' },
					{ name: 'RON', value: 'RON' },
				],
				default: 'CZK',
				description: 'Currency for value',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Customer phone number',
			},
			{
				displayName: 'Send Label to Email',
				name: 'sendLabelToEmail',
				type: 'boolean',
				default: false,
				description: 'Whether to send the label PDF to customer email',
			},
		],
	},
];
