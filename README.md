# n8n-nodes-packeta

This is an n8n community node for **Packeta** (Zásilkovna) - a digital platform and packet delivery solution.

[Packeta](https://www.packeta.com/) is a shipping service that allows you to deliver packets to pick-up points and home addresses across Europe.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### npm

```bash
npm install n8n-nodes-packeta
```

### Manual Installation

1. Clone/download this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the node
4. Copy the `dist` folder contents to `~/.n8n/custom/`
5. Restart n8n

## Credentials

You need a Packeta API password to use this node. You can find your API password in the [Client section](https://client.packeta.com/) of your Packeta account.

The API password is a 32-character hexadecimal string.

## Operations

### Packet

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new packet |
| **Validate** | Validate packet attributes without creating |
| **Cancel** | Cancel a packet (not yet physically submitted) |
| **Get Info** | Get additional information about a packet |
| **Get Stored Until** | Get the date until which the packet is stored |
| **Set Stored Until** | Set the date until which the packet should be stored |
| **Create Claim** | Create a claim assistant packet for returns |
| **Get Courier Number** | Get the external courier number |

### Label

| Operation | Description |
|-----------|-------------|
| **Get PDF** | Get a label as PDF for a single packet |
| **Get ZPL** | Get a label in ZPL format for thermal printers |
| **Get Multiple PDF** | Get labels for multiple packets as single PDF |
| **Get Courier Label PDF** | Get the external courier label as PDF |
| **Get Barcode PNG** | Generate a barcode image (Code 128) |

### Shipment

| Operation | Description |
|-----------|-------------|
| **Create** | Create a new shipment from packet IDs |
| **Get Packets** | Get packets contained in a shipment |

### Tracking

| Operation | Description |
|-----------|-------------|
| **Get Status** | Get current status of a packet |
| **Get History** | Get full tracking history |
| **Get Courier Tracking** | Get tracking history from external courier |

## Usage Examples

### Create a Packet

```json
{
  "resource": "packet",
  "operation": "create",
  "number": "ORDER-12345",
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "addressId": 95,
  "value": 150.00,
  "weight": 1.5,
  "eshop": "MyEshop"
}
```

### Get Label PDF

```json
{
  "resource": "label",
  "operation": "getPdf",
  "packetId": "1234567890",
  "format": "A6 on A6",
  "offset": 0
}
```

### Track a Packet

```json
{
  "resource": "tracking",
  "operation": "getStatus",
  "packetId": "1234567890"
}
```

## Packet Attributes

### Required Fields

| Field | Description |
|-------|-------------|
| `number` | Unique order ID (1-36 alphanumeric) |
| `name` | Recipient's first name |
| `surname` | Recipient's surname |
| `email` or `phone` | At least one contact is required |
| `addressId` | Branch ID or carrier ID |
| `value` | Packet value for insurance |
| `weight` | Weight in kilograms |
| `eshop` | Sender indication |

### Optional Fields

| Field | Description |
|-------|-------------|
| `company` | Recipient's company |
| `currency` | CZK, EUR, HUF, PLN, RON |
| `cod` | Cash on delivery amount |
| `note` | Sender note (displayed on label) |
| `adultContent` | Require age verification |
| `street`, `houseNumber`, `city`, `zip` | For home delivery |
| `size` (length, width, height) | In millimeters |
| `carrierPickupPoint` | For carriers with pickup points |
| `carrierService` | Additional carrier services |

## Status Codes

Common status codes returned by tracking:

| Code | Text | Description |
|------|------|-------------|
| 1 | received | Packet received |
| 2 | arrived | Packet arrived at branch |
| 3 | prepared | Ready for pickup |
| 4 | departed | Departed from branch |
| 5 | delivered | Delivered to recipient |
| 6 | sent back | Returning to sender |
| 7 | delivered back | Returned to sender |
| 10 | cancelled | Packet cancelled |

For complete status code list, see [Packeta Status Codes](https://docs.packeta.com/docs/packet-tracking/status-codes).

## Resources

* [Packeta API Documentation](https://docs.packeta.com/)
* [Packeta API Methods](https://docs.packeta.com/docs/api-reference/api-methods)
* [Packeta Data Structures](https://docs.packeta.com/docs/api-reference/data-structures)
* [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## Compatibility

* n8n version: 0.200.0+
* Node.js: 18+

## License

[MIT](LICENSE)

## Support

For Packeta API issues, contact: [integrations@packeta.com](mailto:integrations@packeta.com)

For node issues, please open an issue on GitHub.
