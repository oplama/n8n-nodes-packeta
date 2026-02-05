import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PacketaApi implements ICredentialType {
	name = 'packetaApi';
	displayName = 'Packeta API';
	documentationUrl = 'https://docs.packeta.com/docs/getting-started/packeta-api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Password',
			name: 'apiPassword',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API password (32 character hex string) from your Packeta account. You can find it in the Client section.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'The API key (16 character string) for advanced features like return routing. Optional for basic operations.',
		},
		{
			displayName: 'Default Sender (Eshop)',
			name: 'senderName',
			type: 'string',
			default: '',
			required: false,
			description: 'Default sender identification (eshop name). Used when you have multiple senders configured in your Packeta account.',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'options',
			options: [
				{
					name: 'Production (zasilkovna.cz)',
					value: 'https://www.zasilkovna.cz/api/rest',
				},
				{
					name: 'Production (packeta.com)',
					value: 'https://www.packeta.com/api/rest',
				},
			],
			default: 'https://www.zasilkovna.cz/api/rest',
			description: 'The Packeta API endpoint to use',
		},
	];

	// This is not used for XML API authentication but can be used for testing
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			method: 'POST',
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
			},
			body: `<?xml version="1.0" encoding="utf-8"?><packetAttributesValid><apiPassword>={{$credentials.apiPassword}}</apiPassword><packetAttributes><number>test123</number><name>Test</name><surname>Test</surname><email>test@test.com</email><addressId>95</addressId><value>100</value><weight>1</weight><eshop>Test</eshop></packetAttributes></packetAttributesValid>`,
		},
	};
}
