const express = require('express');
const app = express();
const Pipeprive = require('pipedrive');
const fs = require('fs');

const PORT = 1800;

Pipeprive.Configuration.apiToken = require('./API_TOKEN.json').token;

const dealsController = Pipeprive.DealsController;
const organizationsController = Pipeprive.OrganizationsController;
const personsController = Pipeprive.PersonsController;
const usersController = Pipeprive.UsersController;

/**
 * Custom Error class for API GET-request errors
 */
class APIGetRequestError extends Error {
	constructor(message) {
		super(message)
		this.name = "APIGetRequestError"
	}
}

/**
 * Repeatedly invokes a pipedrive node-library HTTP GET-request function until all the data availble through pagination
 * is completed.
 * @async
 * @param {function} f - API function
 * @param {Array<any>} options - The options object with which to use as the first argument when invoking 'f'. The
 * properties, 'start' and 'limit' will be overridden.
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function depletePagination(f, options = {}) {
	try {
		const data = []
		let hasMoreItems = true
		let nextPaginationStart = 0
		while (hasMoreItems) {
			options.start = nextPaginationStart
			options.limit = 5000
			const result = await f(options)
			if (result.success !== true) {
				throw new APIGetRequestError(f.name + ' API call not successful')
			}
			for (let i = 0; i < result.data.length; i++) {
				data.push(result.data[i])
			}
			if (result.additional_data.pagination.more_items_in_collection) {
				nextPaginationStart = result.additional_data.pagination.next_start
			} else {
				hasMoreItems = false
			}
		}
		return data
	} catch (e) {
		console.error(e)
	}
}

/**
 * Returns an array of all deals
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllDeals() {
	try {
		return await depletePagination(dealsController.getAllDeals)
	} catch (e) {
		console.log(e);
	}
}

/**
 * Returns an array of all open deals
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllOpenDeals() {
	try {
		/*
		const data = await getAllDeals()
		const openDeals = []
		for (let i = 0; i < data.length; i++) {
			if (data[i].status === 'open') {
				openDeals.push(data[i])
			}
		}
		return openDeals
		*/
		return require('E:\\repos\\packages\\pipedrive-services\\temp\\allOpenDeals.json')
	} catch (e) {
		console.log(e);
	}
}

/**
 * Returns an array of all organizations
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllOrganizations() {
	try {
		// return await depletePagination(organizationsController.getAllOrganizations)
		return require('E:\\repos\\packages\\pipedrive-services\\temp\\allOrganizations.json')
	} catch (e) {
		console.log(e);
	}
}

/**
 * Returns an array of all people
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllPeople() {
	try {
		//return await depletePagination(personsController.getAllPersons)
		return require('E:\\repos\\packages\\pipedrive-services\\temp\\allPeople.json')
	} catch (e) {
		console.log(e);
	}
}

/**
 * Returns an array of all users
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllUsers() {
	try {
		/*
		const result = await usersController.getAllUsers()
		if (result.success !== true) {
			throw new APIGetRequestError(f.name + ' API call not successful')
		}
		return result.data
		*/
		return require('E:\\repos\\packages\\pipedrive-services\\temp\\allUsers.json')
	} catch (e) {
		console.log(e);
	}
}

/**
 * Du kan se relationerne mellem Organisationer, Contacts og Deals/Leads (Bare glem leads) i vedhæftede diagram. En Deal
 * er en salgs mulighed vi arbejder på. Så en deal er altid tilknyttet en potentiel kunde (Organisation), som vi så har
 * en eller flere kontakter hos. Det jeg er ude efter er i første omgang, at trække en liste over alle "Åbne Deals". Der
 * er andre Deals som vi har lukket, enten som vundet eller tabt. Dem skal der ikke ske noget med. Med listen over alle
 * de åbne Deals, vil jeg så se hvilen Sekoia user som er owner, og så sætte vedkomende til også at være Owner af den
 * organisation som Deal er tilknyttet. Der næst, trække en liste over alle Organisations, se for hver enkelt hvem som
 * er owner, og så sætte vedkommende til at være owner af alle de Contacts som er tilknyttet organisationen.
 */
async function main() {
	try {

		// const user = await lib.UsersController.getCurrentUserData();
		// console.log(user)

		const openDeals = await getAllOpenDeals()
		const organizations = await getAllOrganizations()
		const people = await getAllPeople()
		const users = await getAllUsers()

		//fs.writeFileSync('E:\\repos\\packages\\pipedrive-services\\temp\\allOpenDeals.json', JSON.stringify(openDeals), 'utf8');
		//fs.writeFileSync('E:\\repos\\packages\\pipedrive-services\\temp\\allOrganizations.json', JSON.stringify(organizations), 'utf8');
		//fs.writeFileSync('E:\\repos\\packages\\pipedrive-services\\temp\\allPeople.json', JSON.stringify(people), 'utf8');
		//fs.writeFileSync('E:\\repos\\packages\\pipedrive-services\\temp\\allUsers.json', JSON.stringify(users), 'utf8');

		// console.log(openDeals[10])
		// console.log(organizations[10])
		// console.log(people[10])
		// console.log(users[10])

		console.log('openDeals: ' + openDeals.length)
		console.log('organizations: ' + organizations.length)
		console.log('people: ' + people.length)
		console.log('users: ' + users.length)


		for (const deal of openDeals) {
			if (deal.user_id) {
				//console.log(deal)
			}
		}

		// find alle open deals, som har anden ejer end TMJ
		console.log(openDeals.find((value, i) => {
			if (value.user_id) {
				return value.user_id.name !== 'Thomas Møller Jensen'
			} else {
				return false
			}
		}))

		// find alle kontaktpersoner, som har anden ejer end TMJ
		console.log(people.find((value, i) => {
			if (value.owner_id) {
				return value.owner_id.name === 'Thomas Møller Jensen'
			} else {
				return false
			}
		}))

	} catch (e) {
		console.log(e);
	}
}

main().catch((e) => {
	console.log(e)
})



/*
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});

app.get('/', async (req, res) => {
	const user = await lib.UsersController.getCurrentUserData();
	res.send(user);
});
*/
