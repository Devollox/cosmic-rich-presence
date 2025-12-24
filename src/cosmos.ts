export type AstronomicalObject = {
	name: string
	fullName: string
	typePhoto: string
	zoom: number
	description: string
	coordinates: [number, number]
	type: string
	distance?: { value: number; unit: string }
	apparentMagnitude?: number
	velocity?: { value: number; unit: string }
	redshift?: { value: number | string; error: string; unit: string }
	radius?: { value: number; unit: string }
	discoveryMethod?: string
	visibleSize?: string
	mass?: { value: number; unit: string }
}

export type RpcButton = { label: string; url: string }

export type CosmosAssets = {
	largeImage: string
	largeTextFromObject: (obj: AstronomicalObject) => string
}

export type CosmosPreset = {
	id: 'cosmos'
	objects: AstronomicalObject[]
	assets: CosmosAssets
	pickRandom: (
		objects: AstronomicalObject[],
		discoveries: string[]
	) => AstronomicalObject
	getDetails: (obj: AstronomicalObject) => string
	getInitialState: (obj: AstronomicalObject) => string
	getExploredState: (obj: AstronomicalObject) => string
	getButtons: (obj: AstronomicalObject, toggleButton: boolean) => RpcButton[]
	getObjectName: (obj: AstronomicalObject) => string
	getExtra: (obj: AstronomicalObject) => string
}

export const astronomicalObjects: AstronomicalObject[] = [
	{
		name: 'PGC 54559',
		fullName: 'USNOA2 1050-07455174 (PGC 54559)',
		typePhoto: 'IMG_all',
		zoom: 13,
		description:
			'A rare ring galaxy with a bright ring of young, blue stars surrounding a central core.',
		coordinates: [15.28734148148148, 21.585525000000004],
		type: 'Ring galaxy',
		distance: {
			value: 600,
			unit: 'million light-years',
		},
		apparentMagnitude: 15.1,
		velocity: {
			value: 12453,
			unit: 'km/s',
		},
		redshift: {
			value: 12740,
			error: '± 50',
			unit: '',
		},
		radius: {
			value: 50000,
			unit: 'light-years',
		},
		discoveryMethod: 'Observed with large ground-based telescopes',
	},
	{
		name: "Stephan's Quintet",
		fullName: "Stephan's Quintet",
		typePhoto: 'IMG_all',
		zoom: 11,
		type: 'Galaxy group',
		description:
			'A compact group of five galaxies in Pegasus, famous for violent interactions and a large shock wave.',
		coordinates: [22.5993, 33.9567],
		distance: {
			value: 290,
			unit: 'million light-years',
		},
		redshift: {
			value: 0.0215,
			error: '± 0.0006',
			unit: '',
		},
		apparentMagnitude: 13.0,
		discoveryMethod: 'Discovered by Édouard Stephan in 1877',
	},
	{
		name: 'NGC 7317',
		fullName: 'NGC 7317',
		typePhoto: 'IMG_all',
		zoom: 11,
		type: 'Elliptical galaxy',
		description:
			"An elliptical member of Stephan's Quintet, located toward the lower right of the group.",
		coordinates: [22.5977, 33.9453],
		distance: {
			value: 95.9,
			unit: 'million light-years',
		},
		redshift: {
			value: 0.022012,
			error: '± 8.7E-5',
			unit: '',
		},
		apparentMagnitude: 13.6,
		visibleSize: '0.832′ × 0.794′',
		discoveryMethod: 'Discovered by Édouard Jean-Marie Stephan in 1876',
	},
	{
		name: 'NGC 7318A',
		fullName: 'NGC 7318A',
		typePhoto: 'IMG_all',
		zoom: 11,
		type: 'Elliptical galaxy',
		description:
			"An elliptical galaxy in Stephan's Quintet showing signs of peculiarity due to interactions.",
		coordinates: [22.5986, 33.9661],
		distance: {
			value: 96.3,
			unit: 'million light-years',
		},
		redshift: {
			value: 0.022012,
			error: '± 8.7E-5',
			unit: '',
		},
		apparentMagnitude: 13.4,
		visibleSize: '1.318′ × 1.202′',
		discoveryMethod: 'Discovered by Édouard Jean-Marie Stephan in 1876',
	},
	{
		name: 'NGC 7318B',
		fullName: 'NGC 7318B',
		typePhoto: 'IMG_all',
		zoom: 11,
		type: 'Spiral galaxy',
		description:
			"A barred spiral galaxy currently colliding and interacting with NGC 7318A in Stephan's Quintet.",
		coordinates: [22.5987, 33.9667],
		distance: {
			value: 83.7,
			unit: 'million light-years',
		},
		redshift: {
			value: 0.0218,
			error: '± 0.0003',
			unit: '',
		},
		apparentMagnitude: 13.2,
		visibleSize: '2′ × 1.05′',
		discoveryMethod: 'Discovered by Édouard Jean-Marie Stephan in 1876',
	},
	{
		name: 'NGC 7319',
		fullName: 'NGC 7319',
		typePhoto: 'IMG_all',
		zoom: 11,
		type: 'Spiral galaxy',
		description:
			"A barred spiral galaxy with an active galactic nucleus in Stephan's Quintet.",
		coordinates: [22.6003, 33.9765],
		distance: {
			value: 95.3,
			unit: 'million light-years',
		},
		redshift: {
			value: 0.023,
			error: '± 0.0002',
			unit: '',
		},
		apparentMagnitude: 13.3,
		visibleSize: '1.62′ × 1.07′',
		discoveryMethod: 'Discovered by Édouard Jean-Marie Stephan in 1876',
	},
	{
		name: 'M60',
		fullName: 'M60',
		typePhoto: 'IMG_all',
		zoom: 10,
		type: 'Elliptical galaxy',
		coordinates: [12.7278055555333, 11.552222222000001],
		distance: {
			value: 56.7,
			unit: 'million light-years',
		},
		apparentMagnitude: 8.8,
		velocity: {
			value: 1108,
			unit: 'km/s',
		},
		redshift: {
			value: 0.003726,
			error: '± 0.00001',
			unit: '',
		},
		radius: {
			value: 128,
			unit: 'arcseconds',
		},
		description:
			'A bright elliptical galaxy in Virgo, roughly 57 million light-years from Earth.',
	},
	{
		name: 'NGC 7320',
		fullName: 'NGC 7320',
		typePhoto: 'IMG_all',
		zoom: 11,
		type: 'Spiral galaxy',
		description:
			'A foreground spiral galaxy projected onto Stephan’s Quintet, much closer to Earth than the main group.',
		coordinates: [22.6003, 33.9484],
		distance: {
			value: 39,
			unit: 'million light-years',
		},
		redshift: {
			value: 0.002622,
			error: '± 6.7E-5',
			unit: '',
		},
		apparentMagnitude: 12.5,
		visibleSize: '7.943′ × 6.607′',
		discoveryMethod: 'Discovered by Édouard Jean-Marie Stephan in 1876',
	},
	{
		name: 'NGC 5128',
		fullName: 'NGC 5128 (Centaurus A)',
		typePhoto: 'IMG_all',
		zoom: 10,
		type: 'Lenticular/elliptical galaxy',
		description:
			'Centaurus A is a nearby, bright radio galaxy with a striking dust lane and an active nucleus.',
		coordinates: [13.4243, -43.0192],
		distance: {
			value: 11,
			unit: 'million light-years',
		},
		redshift: {
			value: 547,
			error: '± 5',
			unit: 'km/s',
		},
		apparentMagnitude: 6.84,
		visibleSize: '25.704′ × 17.783′',
	},
	{
		name: 'PGC 17223',
		fullName: 'Large Magellanic Cloud (LMC)',
		typePhoto: 'DSS2',
		zoom: 6,
		type: 'Magellanic spiral galaxy',
		description:
			'The Large Magellanic Cloud is the most massive satellite galaxy of the Milky Way.',
		coordinates: [5.3929, -69.7561],
		distance: {
			value: 50,
			unit: 'kpc',
		},
		redshift: {
			value: 0.00093,
			error: '± 0.00003',
			unit: '',
		},
		apparentMagnitude: 0.4,
		visibleSize: '645.654′ × 549.541′',
	},
	{
		name: 'Betelgeuse',
		fullName: 'α Ori (Betelgeuse)',
		typePhoto: 'DSS2',
		zoom: 9,
		type: 'Red supergiant star',
		description:
			'Betelgeuse is one of the brightest and most recognizable stars in the constellation Orion.',
		coordinates: [5.971, 7.407],
		distance: {
			value: 0.4,
			unit: 'kpc',
		},
		redshift: {
			value: 0.0,
			error: '± 0.00003',
			unit: '',
		},
		apparentMagnitude: 0.5,
		visibleSize: '40′ × 40′',
	},
]
