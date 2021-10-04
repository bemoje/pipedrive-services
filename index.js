const Pipeprive = require('pipedrive');
const log = require('loglevel');

// import API token
Pipeprive.Configuration.apiToken = require('./API_TOKEN.json').token;

// set log level
log.setLevel("info");

// Pipeprive controllers
const dealsController = Pipeprive.DealsController;
const organizationsController = Pipeprive.OrganizationsController;
const personsController = Pipeprive.PersonsController;
const usersController = Pipeprive.UsersController;

/**
 * Custom Error class for API GET-request errors
 */
class APIGetRequestError extends Error {
   constructor (message) {
      super(message);
      this.name = "APIGetRequestError";
   }
}

/**
 * Repeatedly invokes a pipedrive node-library HTTP GET-request function until all the data availble through pagination
 * is completed.
 * @param {function} f - API function
 * @param {Array<any>} options - The options object with which to use as the first argument when invoking 'f'. The
 * properties, 'start' and 'limit' will be overridden.
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function depletePagination (f,options = {}) {
   try {
      const data = [];
      let hasMoreItems = true;
      let nextPaginationStart = 0;
      while (hasMoreItems) {
         options.start = nextPaginationStart;
         options.limit = 500;
         const result = await f(options);
         if (result.success !== true) {
            throw new APIGetRequestError(f.name + ' API call not successful');
         }
         if (result.data) {
            for (let i = 0; i < result.data.length; i++) {
               data.push(result.data[ i ]);
            }
         }
         if (result.additional_data.pagination.more_items_in_collection) {
            nextPaginationStart = result.additional_data.pagination.next_start;
         } else {
            hasMoreItems = false;
         }
      }
      return data;
   } catch (e) {
      console.error(e);
   }
}

/**
* Invokes a pipedrive node-library HTTP GET-request function that does not use pagination.
* @param {function} f - API function
* @param {Array<any>} options - The options object with which to use as the first argument when invoking 'f'.
* @throws {APIGetRequestError} if API call is not successful
* @returns {Promise<Array<object>>}
*/
async function getNonPagination (f,options) {
   try {
      const result = await f(options);
      if (result.success !== true) {
         throw new APIGetRequestError(f.name + ' API call not successful');
      }
      return result.data;
   } catch (e) {

   }
}

/**
 * Returns an array of all deals
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllDeals () {
   try {
      return await depletePagination(dealsController.getAllDeals);
   } catch (e) {
      log.error(e);
   }
}

/**
 * Returns an array of all open deals
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllOpenDeals () {
   try {
      const data = await getAllDeals();
      const openDeals = [];
      for (const deal of data) {
         if (deal.status === 'open') {
            openDeals.push(deal);
         }
      }
      return openDeals;
   } catch (e) {
      log.error(e);
   }
}

/**
 * Returns an array of all organizations
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllOrganizations () {
   try {
      return await depletePagination(organizationsController.getAllOrganizations);
   } catch (e) {
      log.error(e);
   }
}

/**
 * Returns an array of all people
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllPeople () {
   try {
      return await depletePagination(personsController.getAllPersons);
   } catch (e) {
      log.error(e);
   }
}

/**
 * Returns an array of all users
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function getAllUsers () {
   try {
      return await getNonPagination(usersController.getAllUsers);
   }
   catch (e) {
      log.error(e);
   }
}

/**
 * Returns an array of all people in an organization
 * @param {number} id - Integer ID of the organization
 * @throws {APIGetRequestError} if API call is not successful
 * @returns {Promise<Array<object>>}
 */
async function listPersonsOfAnOrganization (id) {
   try {
      return await depletePagination(organizationsController.listPersonsOfAnOrganization,{
         id
      });
   } catch (e) {
      log.error(e);
   }
}

/**
 * Returns the ID of an organization.
 * @param {object} organization
 * @returns {number} integer ID
 */
function getDealOrganizationOwnerID (deal) {
   return deal.org_id.owner_id;
}

/**
 * Returns the ID of a deal's owner.
 * @param {object} deal
 * @returns {number} integer ID
 */
function getDealOwnerID (deal) {
   return deal.user_id.value;
}

/**
 * Returns the name of a deal's owner.
 * @param {object} deal
 * @returns {string}
 */
function getDealOwnerName (deal) {
   return deal.user_id.name;
}

/**
 * Returns the title of a deal.
 * @param {object} deal
 * @returns {string}
 */
function getDealTitle (deal) {
   return deal.title;
}

/**
 * Returns the ID of an organization.
 * @param {object} organization
 * @returns {number} integer ID
 */
function getOrganizationID (organization) {
   return organization.id;
}

/**
 * Returns the name of an organization.
 * @param {object} organization
 * @returns {string}
 */
function getOrganizationName (organization) {
   return organization.name;
}

/**
 * Returns the ID of an organization.
 * @param {object} organization
 * @returns {number} integer ID
 */
function getOrganizationOwnerID (organization) {
   return organization.owner_id.value;
}

/**
 * Returns the name of the owner of an organization.
 * @param {object} organization
 * @returns {string}
 */
function getOrganizationOwnerName (organization) {
   return organization.owner_id.name;
}

/**
 * Returns the number of contact people an organization has.
 * @param {object} organization
 * @returns {number} integer
 */
function getOrganizationPeopleCount (organization) {
   return organization.people_count;
}

/**
 * Returns the owner ID of a contact person.
 * @param {object} person
 * @returns {number} integer ID
 */
function getPersonOwnerID (person) {
   return person.owner_id.value;
}

/**
 * Returns the name of a contact person.
 * @param {object} person
 * @returns {string}
 */
function getPersonName (person) {
   return person.name;
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
async function main () {
   try {
      // Pre-download as much as the needed data as possible for faster overall runtime
      const users = await getAllUsers();
      log.info('INFO: All users downloaded.');

      const openDeals = await getAllOpenDeals();
      log.info('INFO: All open deals downloaded.');

      const organizations = await getAllOrganizations();
      log.info('INFO: All organizations downloaded.');

      // Ensure deal owners are also owners of the organizations related to the deal.
      for (const deal of openDeals) {
         if (!deal.org_id) {
            log.warn('WARNING: No organization found related to open deal ' + getDealTitle(deal));
            continue;
         }
         if (getDealOwnerID(deal) !== getDealOrganizationOwnerID(deal)) {
            log.trace(`ACTION: Set deal owner (${getDealOwnerName(deal)}) to be owner of organization ${getDealOwnerName(deal)}`);
         }
         log.info('INFO: Finished processing deal: ' + getDealTitle(deal));
      }

      // Ensure owner of all organizations also owns their respective contact people.
      for (const organization of organizations) {
         if (!organization.owner_id) {
            log.warn('WARNING: Organization has no owner: ' + getOrganizationName(organization));
            continue;
         }
         if (getOrganizationPeopleCount(organization) < 1) {
            log.info(`INFO: Organization has no contact people: ${getOrganizationName(organization)}`);
            continue;
         }
         const people = await listPersonsOfAnOrganization(getOrganizationID(organization));
         for (const person of people) {
            if (!person.owner_id) {
               log.warn('WARNING: Contact person has no owner: ' + getPersonName(person));
               continue;
            }
            if (getPersonOwnerID(person) !== getOrganizationOwnerID(organization)) {
               log.trace(`ACTION: Set (${getOrganizationOwnerName(organization)}) to be owner of contact person ${getPersonName(person)}, ${getOrganizationName(organization)}`);
            }
            log.info('INFO: Finished processing contact person: ' + getPersonName(person));
         }
         log.info('INFO: Finished processing organization: ' + getOrganizationName(organization));
      }
   } catch (e) {
      log.error(e);
   }
}

main().catch((e) => {
   log.error(e);
});
