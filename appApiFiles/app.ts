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
import { Router, HttpMethod } from './router'

const { request, response } = B.net;


// Return
let rtn = {};

// Parse URL Params
const path = request.path();
export const pathParts = path.split("/"); // Kept for potential external use or debugging

//[1] = b
//[2] = eventService (or appApi as per original comments)
//[3] = Version
//[4...] = effective path for the router

console.log(pathParts); // Kept for debugging

const method = request.method() as HttpMethod; // Cast to our defined type
const v1 = pathParts[3] === "v1";
const v2 = pathParts[3] === "v2";

// --- Router for V1 ---
const routerV1 = new Router();

// Registering V1 routes
routerV1.GET("formVersion/:entryId", (p) => {
  const entry = B.find.formEntry(p.entryId);
  return { id: entry.id().shortId(), version: entry.version() };
});
routerV1.GET("properties", () => ({
  "path1": "version" + ["v1", 'v2'], // This might need adjustment if v2 properties differ
  "path2": ["staff", "res", "locations", "mar", "adl", "beh", "goal"]
}));

routerV1.GET("staff", () => getAllStaff());
routerV1.GET("staff/:staffId", (p) => getStaffProfile(p.staffId));

routerV1.GET("res", () => getAllResidents());
routerV1.GET("res/:resId", (p) => getResidentProfile(p.resId));
routerV1.GET("res/:resId/mar", (p) => getResidentMars(p.resId));
routerV1.PUT("res/:resId/mar/:marId", (p) => {
  console.log("V1 Update Mar entry");
  return updateMarEntry(p.resId, p.marId);
});
routerV1.GET("res/:resId/adl", (p) => getResidentAdls(p.resId));
routerV1.GET("res/:resId/beh", (p) => getResidentBehs(p.resId));
routerV1.GET("res/:resId/goal", (p) => getResidentGoals(p.resId));
routerV1.GET("res/:resId/clientTime", (p) => {
  return {}; 
});
routerV1.POST("res/:resId/clientTime", (p) => {
  console.log("V1 Create ClientTime entry");
  return createClientTimeEntry(p.resId);
});

routerV1.GET("mar", () => getAllMars());
routerV1.GET("adl", () => getAllAdls());
routerV1.GET("beh", () => getAllBehs());
routerV1.GET("goal", () => getAllGoals());
routerV1.GET("homeTasks", () => getAllHomeTasks());
routerV1.GET("locations", () => getAllLocations());
routerV1.GET("calendar", () => getAllEvents());
routerV1.GET("home", () => getUnitHomeData());

routerV1.GET("schema/mar", () => getMarSchema());
routerV1.GET("schema/adl", () => routerV1.todo()); // Use routerV1's todo
routerV1.GET("schema/beh", () => routerV1.todo()); // Use routerV1's todo
routerV1.GET("schema/badAction", () => getBadActionSchema());
routerV1.GET("schema/badCondition", () => getBadConditionSchema());

// --- Router for V2 ---
const routerV2 = new Router();

// Registering example V2 routes
// For staff, let's return data with an explicit apiVersion field
// routerV2.GET("staff", () => {
//   console.log("V2 API: Handling GET /staff");
//   const staffList = getAllStaff(); // Assuming getAllStaff returns an array
//   return Array.isArray(staffList) ? staffList.map((s: any) => ({ ...s, apiVersion: "v2" })) : { data: staffList, apiVersion: "v2" };
// });
// routerV2.GET("staff/:staffId", (p) => {
//   console.log(`V2 API: Handling GET /staff/${p.staffId}`);
//   const staffProfile = getStaffProfile(p.staffId);
//   return { ...staffProfile, apiVersion: "v2" };
// });
// Add other V2 routes here. If a route is the same as V1, you can register it
// on routerV2 and point to the same V1 handler function.
// For example, if 'res' is unchanged in V2:
// routerV2.GET("res", () => getAllResidents());
// routerV2.GET("res/:resId", (p) => getResidentProfile(p.resId));
// If a V2 route is not defined, it will result in "Unsupported Path".

// --- End Router Configuration ---

let activeRouter: Router | null = null;

if (v1) {
  activeRouter = routerV1;
} else if (v2) {
  activeRouter = routerV2;
}

if (activeRouter) {
  const effectivePath = pathParts.slice(4).join('/');
  rtn = activeRouter.handleRequest(method, effectivePath);
} else {
  // Neither v1 nor v2 matched in the path, or version segment is missing/invalid.
  // Use routerV1's error handler as a default for unsupported versions.
  // (Ensure routerV1 is always instantiated even if no v1 routes were to be defined)
  routerV1.throwUnsupportedPath(method, path);
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

// Send response only if an active router was determined AND it hasn't already sent a response
if (activeRouter && !activeRouter.hasSentResponse()) {
  const responseData = rtn === undefined ? {} : rtn; 
  response.contentType("application/json");
  response.characterEncoding("UTF-8");
  response.out(JSON.stringify(responseData));
}