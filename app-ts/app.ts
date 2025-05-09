/// <reference path='../../../scriptlibrary/363769___303' />
/**
 * This is based on a similar end point in family services
 * https://ldsrelate.bluestep.net/shared/admin/applications/relate/editScript.jsp?_event=edit&_id=363769___321
 * 
 * Changes have been made to make it more "restful" and follow rest url patterns
 */
console.log("Starting: ")
import { getStaffProfile, getResidentProfile, getResidentMars, updateMarEntry, getResidentAdls, getResidentBehs, getResidentGoals, createClientTimeEntry } from './individualFunctions'
import { getAllStaff, getAllResidents, getAllMars, getAllAdls, getAllBehs, getAllGoals, getAllLocations, getAllCalendarEntries, getUnitHomeData, getAllHomeTasks } from './unitFunctions'
import { getOrgData, getAllEvents } from './payloadFunctions'
import { getMarSchema, getBadActionSchema, getBadConditionSchema } from './schemaFunctions'

const { request, response } = B.net;


// Return
let rtn = {};

// TimeZone
const z = B.time.userZoneId();

// Parse URL Params
const path = request.path();
export const pathParts = path.split("/");

//[1] = b
//[2] = eventService
//[3] = Version
//[4] = noun - event/provider...
//[5] = nounId - resId, staffId, etc
//[6] = subNoun - res MAR, staff Calendar, etc
//[7] = subNounId - res MAR id, staff Calendar id, etc

console.log(pathParts)

const method = request.method();
const isGet = method === "GET";
const isPost = method === "POST";
const isPut = method === "PUT";
const isDelete = method === "DELETE";

const v1 = pathParts[3] === "v1";

// /b/eventService

const isStaff = pathParts[4] === "staff";
const isRes = pathParts[4] === "res";
const isLocation = pathParts[4] === "location";
const isMar = pathParts[5] === "mar";
const isId = pathParts[5]?.startsWith("id");
const isAdl = pathParts[5] === "adl";
const isGoal = pathParts[5] === "goal";
const isProvSched = pathParts[4] === "provSched";


if (v1) {
  // Check for Staff, resident, or location.
  switch (pathParts[4]) {
    case "formVersion":
      const form = B.find.formEntry(pathParts[5])
      const formInfo = {
        id: form.id().shortId(),
        version: form.version()
      }
      rtn = formInfo
      break
    case "properties":
      const propRtn = {
        "path1": "version" + ["v1", 'v2'],
        "path2": ["staff", "res", "locations", "mar", "adl", "beh", "goal"]
      }
      rtn = propRtn




    case "staff":
      if (isGet && checkNullThrowIfEmpty(pathParts[5])) {
        // GET /b/appApi/v1/staff
        rtn = getAllStaff()
        break;
      } else if (isGet && !checkNullThrowIfEmpty(pathParts[5])) {
        // GET /b/appApi/v1/staff/{staffId}
        let staffId = pathParts[5]
        rtn = getStaffProfile(staffId)
        break;
      }
    case "res":
      if (isGet && checkNullThrowIfEmpty(pathParts[5])) {
        // GET /b/appApi/v1/res
        rtn = getAllResidents()
        break
      } else if (!checkNullThrowIfEmpty(pathParts[5])) {
        let resId = pathParts[5];
        if (isGet && checkNullThrowIfEmpty(pathParts[6])) {
          // GET /b/appApi/v1/res/{resId}
          rtn = getResidentProfile(resId)
          break
        } else if (pathParts[6] === "mar") {
          if (checkNullThrowIfEmpty(pathParts[7])) {
            if (isGet) {
              // GET /b/appApi/v1/res/{resId}/mar
              rtn = getResidentMars(resId)
              break
            }
          } else {
            if (isPut) {
              // PUT /b/appApi/v1/res/{resId}/mar/{marId}
              console.log("Update Mar entry")
              updateMarEntry(resId, pathParts[7])
              break
            }
          }
        } else if (pathParts[6] === "adl") {
          if (isGet) {
            // GET /b/appApi/v1/res/{resId}/adl/
            rtn = getResidentAdls(resId)
            break
          }
        } else if (pathParts[6] === "beh") {
          if (isGet) {
            // GET /b/appApi/v1/res/{resId}/beh/
            rtn = getResidentBehs(resId)
            break
          }
        } else if (pathParts[6] === "goal") {
          if (isGet) {
            // GET /b/appApi/v1/res/{resId}/goal/
            rtn = getResidentGoals(resId)
            break
          }
        } else if (pathParts[6] === "clientTime") {
          if (isGet) {
            // GET /b/appApi/v1/res/{resId}/clientTime
            // rtn = getResidentClientTime(resId)
            break
          }
          if (isPut) {
            // PUT /b/appApi/v1/res/{resId}/mar/{marId}
            console.log("Create ClientTime entry")
            createClientTimeEntry(resId)
            break
          }
        }
      }
    case "mar":
      if (isGet) {
        // GET /b/appApi/v1/mar/
        rtn = getAllMars();
        break
      }
    case "adl":
      if (isGet) {
        // GET /b/appApi/v1/adl/
        rtn = getAllAdls();
        break
      }
    case "beh":
      if (isGet) {
        // GET /b/appApi/v1/beh/
        rtn = getAllBehs();
        break
      }
    case "goal":
      if (isGet) {
        // GET /b/appApi/v1/goal/
        rtn = getAllGoals();
        break
      }
    case "homeTasks":
      if (isGet) {
        // GET /b/appApi/v1/homeTasks/
        rtn = getAllHomeTasks();
        break
      }
    case "locations":
      if (isGet) {
        // GET /b/appApi/v1/locations/
        rtn = getAllLocations()
        break
      }
    case "calendar":
      if (isGet) {
        // GET /b/appApi/v1/calendar/
        rtn = getAllEvents()
        break
      }
    case "home":
      if (isGet) {
        rtn = getUnitHomeData()
        break
      }
    case "schema":
      try {
        if (isGet && !checkNullThrowIfEmpty(pathParts[5])) {
          const requestedForm = pathParts[5];
          // GET /b/appApi/v1/schema/mar
          if (requestedForm === "mar") {
            rtn = getMarSchema();
            break;
          }
          // GET /b/appApi/v1/schema/adl
          else if (requestedForm === "adl") {
            todo();
            break;
          }
          // GET /b/appApi/v1/schema/beh
          else if (requestedForm === "beh") {
            todo();
            break;
          }
          // GET /b/appApi/v1/schema/badAction
          // This is just used for testing
          else if (requestedForm === "badAction") {
            rtn = getBadActionSchema();
            break;
          }
          // GET /b/appApi/v1/schema/badCondition
          // This is just used for testing
          else if (requestedForm === "badCondition") {
            rtn = getBadConditionSchema();
            break;
          }
        }
      } catch (e) {
        throwException(e);
      }

    case undefined:
    // ???
    // rtn = getOrgData()
    // break

    default:
      throwUnsupportedPath();
  }
} else {
  throwUnsupportedPath();
}
const { Instant, LocalDateTime, Period, Duration, ZoneId, DateTimeFormatter, ZonedDateTime, LocalDate } = B.time;

/**
 * DATE CALCULATIONS
 */
// TODO
// Move everything related to dates, inside a block that only relates to date apis.
const ldF = DateTimeFormatter.ofPattern('yyyy-MM-dd');
const uzid = B.time.userZoneId();
const start = request.parameter("start");
const startDate = start ? Instant.parse(`${start}T00:00:00.0Z`) : Instant.now().minus(Period.ofDays(7));
const startLocalDateTime = (start ? LocalDate.parse(start, ldF) : LocalDate.now(uzid)).minusDays(7).atStartOfDay(uzid);
const end = request.parameter("end");
const endDate = end ? Instant.parse(`${end}T23:59:59.0Z`) : Instant.now();
const endLocalDateTime = (end ? LocalDate.parse(end, ldF) : LocalDate.now(uzid)).atTime(23, 59).atZone(uzid);

// This is temporary, until addSearch can take an instant or millis
const dateFormat = B.time.DateTimeFormatter.ofPattern('MM/dd/yyyy h:mma').withZone(uzid);
const actualDateFormat = B.time.DateTimeFormatter.ofPattern('MM/dd/yyyy').withZone(uzid);
const startDateStr = dateFormat.format(startLocalDateTime);
const endDateStr = dateFormat.format(endLocalDateTime);
const startOnlyDateStr = actualDateFormat.format(startLocalDateTime);
const endOnlyDateStr = actualDateFormat.format(endLocalDateTime);



let topLevelCommunity;

response.contentType("application/json");
response.characterEncoding("UTF-8");
response.out(JSON.stringify(rtn));

function throwUnsupportedPath() {
  console.error(`Unsupported Path: ${request.method()} ${request.path()}}`);
  response.status(404);
  response.out("Unsupported Path");
}

function throwBadPathId() {
  console.error(`Missing Path ID: ${request.method()} ${request.path()}}`);
  response.status(404);
  response.out("Missing Path ID");
}

function throwException(e) {
  response.status(500);
  response.out(e)
}

function todo() {
  response.status(501);
  response.out("This needs to be implemented");
}

function checkNullThrowIfEmpty(str): boolean {
  if (str == null) {
    return true;
  } else {
    if (str === "") {
      throwBadPathId();
    }
  }
  return false;
}
