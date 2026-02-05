import { INodeProperties } from 'n8n-workflow';

export const trackingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tracking'],
			},
		},
		options: [
			{
				name: 'Get Courier Tracking',
				value: 'getCourierTracking',
				description: 'Get tracking history from external courier',
				action: 'Get courier tracking',
			},
			{
				name: 'Get History',
				value: 'getHistory',
				description: 'Get full tracking history for a packet',
				action: 'Get tracking history',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get current status of a packet',
				action: 'Get packet status',
			},
		],
		default: 'getStatus',
	},
];

export const trackingFields: INodeProperties[] = [
	{
		displayName: 'Packet ID',
		name: 'packetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tracking'],
				operation: ['getStatus', 'getHistory', 'getCourierTracking'],
			},
		},
		default: '',
		description: 'The unique packet ID',
	},
];
