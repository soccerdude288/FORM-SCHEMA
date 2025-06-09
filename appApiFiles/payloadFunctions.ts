/// <reference path="../../../scriptlibrary" />
import { getAllResidents, getAllStaff, getAllLocations } from './unitFunctions'
import {
  Data,
  Event,
  BaseIncidentReportData,
  AccidentIllnessIncidentData,
  SeizureIncidentData,
  BehaviorIncidentData,
  IncidentReportData
} from './interfaces'

export function getAllEvents() {
  const rtn: Array<Object> = []
  // allCalendarEntries.addSearch("eventInfo","staffId", "CONTAINS", "21980135")
  // allCalendarEntries.rememberSearchAndSort()
  allCalendarEntries.forEach(calEntry => {
    const { eventType, eventName, locationCommunity, eventLocation, staff, staffId, clients, clientId, startDateTime, endDateTime,
      isRecurring, rrule, duration, recurringEventId, originalStart, deleted, shiftNotes, } = calEntry.forms.eventInfo.fields
      rtn.push({id: calEntry.forms.eventInfo.id().shortId(), name: eventName.val(), eventType: eventType.selectedOptions()[0].displayName(), eventLocation: eventLocation.selectedOptions()[0].displayName(),
      start: startDateTime.val(), end: endDateTime.val(), rrule: rrule.val(), duration: duration.val(), recurringEventId: recurringEventId.val(),
      originalStart: originalStart.val(), deleted: deleted.val(), community: locationCommunity.selected()[0].id().shortId(), communityId: locationCommunity.id().shortId(),
      shiftNotes: shiftNotes.val(), staff: staff.selected().map(staff => staff.recordName()), staffId: staffId.val(), clients: clients.selected().map(client => client.recordName()) })
  })
  return rtn
}

export function getOrgData() {
  const today = B.time.LocalDate.now().format(B.time.DateTimeFormatter.ofPattern("MM/dd/yyyy"));
  const rtn: Data = {
    collections: {
      staff: getAllStaff(),
      residents: getAllResidents(),
      locations: getAllLocations(),
      calendar: getAllEvents()
    },
  }
  return rtn
}

// TODO
// Sliding Scale Instructions concat into instructions (see mar detail)

export function getMarData(mar: MEFR_MAR) {
  const { date, medName, dosage, schedAdmin, comments, note, 
    adminEx, qtyAdministered, adminTime, adminSig, 
    adminExRel, whatVitals, bp, bpd, bps, heartRate, 
    oxygen, temp, glucose, respRate, weight, prePain, 
    postPain, prepSig, medRel, drugCategories } = mar.fields;
  const hasException = adminExRel.selected().length > 0;
  const selectedException = hasException ? adminExRel.selected().get(0).id().shortId() : null;
  let slidingScale;
  try {
    slidingScale = JSON.parse(medRel.selected()[0].entry().formEntry().fields.ssJSON.valOpt().orElse("{}"));
  } catch (e) {
    console.error(`Problem with sliding scale for ${mar.id().shortId()}`);
    console.error(`${medRel.selected()[0].entry().formEntry().fields.ssJSON.valOpt().orElse("{}")}`);
    slidingScale = {};
  }
  return {
    version: mar.version(),
    id: mar.id().shortId(),
    date: date.val()?.format(B.time.DateTimeFormatter.ofPattern('MM/dd/YYYY')), 
    label: extractAnchorText(medName.val()), 
    dosage: dosage.val(), 
    schedAdmin: schedAdmin.selectedOptions()[0]?.displayName(), 
    instructions: comments.val(),
    notes: note.val(), 
    selectedException, 
    quantity: qtyAdministered.val(), 
    adminTime: adminTime.val(), 
    signature: adminSig.timeStamp(),
    drugCategories: drugCategories.selectedOptions().map(o => o.exportValue()),
    dynamicValues: {
      exceptions: adminExRel.options().map(e => { return computeMarExceptionObject(e) }),
      whatVitals: whatVitals.selectedOptions().map(o => o.exportValue()),
      slidingScale
    },
    vitals: {
      bp: bp.val(),
      bpd: bpd.val(),
      bps: bps.val(),
      heartRate: heartRate.val(),
      oxygen: oxygen.val(),
      temp: temp.val(),
      glucose: glucose.val(),
      respRate: respRate.val(),
      weight: weight.val()
    },
    prePain: prePain.val(),
    postPain: postPain.val(),
    prepSig: prepSig.timeStamp()
  };
}

/**
 * Generates incident report data based on incident type
 * @param incident The incident report form entry
 * @returns Typed incident report data object based on incident type
 */
export function getIncidentReportData(incident: MEFR_incidentReport): IncidentReportData {
  // Extract all fields to make them available
  const {
    incType, reportedBy, dateTime, where, whereOther, whoPresent, staffInvolved,
    behaviorMulti, antecedent, incDesc, checkAllIncDesc, suddenIllness,
    physicalAppearanceChange, outcome, checkAllOutcome, firstAid, specifyFirstAid,
    didYouWitnessSeizure, whenDidSeizureHappen, timeLast, beforeSeizure,
    triggers, patientAbleToTalk, eyesDuringSeizure, noticeableBodyMovements,
    lossBowelCont, repeatedMovements, recoveryAfter, weakOrNumb, doesPatientRemember,
    timeUntilResume, physAgroToOthers, physicalAggression, verbalAggression,
    offensiveBeh, sib, refusalOfPrograms, awol, sexualBeh, isolation,
    sleeping, obsessiveBeh, preincident, descript, after, facts, adminSig
  } = incident.fields;

  // Extract common fields for all incident types
  const baseData: BaseIncidentReportData = {
    version: incident.version(),
    id: incident.id().shortId(),
    incType: incType.selectedOptions()[0].displayName(),
    reportedBy: reportedBy.val(),
    dateTime: dateTime.val(),
    where: where.selectedNames(),
    whoPresent: whoPresent.selectedNames(),
    behaviorMulti: behaviorMulti.selectedNames(),
    adminSig: adminSig.user()
  };

  // Determine incident type and return appropriate object
  const incidentTypeValue = incType.selectedOptions()[0].exportValue();

  switch (incidentTypeValue) {
    case 'aii': // Accident/Illness
      return getAccidentIllnessData(baseData, {
        antecedent: antecedent.val(),
        descript: descript.val(),
        incDescriptionCheck: checkAllIncDesc.selectedNames(),
        sickness: suddenIllness.selectedNames(),
        physicalAppearanceChange: physicalAppearanceChange.selectedNames(),
        outcome: outcome.val(),
        outcomeCheck: checkAllOutcome.selectedNames(),
        firstAid: firstAid.valOpt().orElse(false),
        firstAidNote: specifyFirstAid.val()
      });

    case 'seizure': // Seizure
      return getSeizureData(baseData, {
        witnessSeizure: didYouWitnessSeizure.val(),
        seizureDateTime: whenDidSeizureHappen.val(),
        seizureLength: timeLast.val(),
        beforeSeizure: beforeSeizure.val(),
        triggers: triggers.val(),
        patientTalk: patientAbleToTalk.val(),
        eyes: eyesDuringSeizure.val(),
        bodyMovements: noticeableBodyMovements.val(),
        bowelControl: lossBowelCont.val(),
        repeatedMovements: repeatedMovements.val(),
        recovery: recoveryAfter.val(),
        weakNumb: weakOrNumb.val(),
        patientRemember: doesPatientRemember.val(),
        timeUntilFunction: timeUntilResume.val()
      });

    case 'behavior': // Behavior
      return getBehaviorData(baseData, {
        physAgrotoOthers: physAgroToOthers.selectedNames(),
        physicalAggression: physicalAggression.selectedNames(),
        verbalAggression: verbalAggression.selectedNames(),
        offensiveBeh: offensiveBeh.selectedNames(),
        sib: sib.selectedNames(),
        refulaoOfPrograms: refusalOfPrograms.selectedNames(),
        awol: awol.selectedNames(),
        sexualBeh: sexualBeh.selectedNames(),
        isolation: isolation.selectedNames(),
        sleeping: sleeping.selectedNames(),
        obsessiveBeh: obsessiveBeh.selectedNames(),
        preIncident: preincident.val(),
        description: descript.val(),
        after: after.val(),
        facts: facts.val()
      });

    default:
      console.error(`Unknown incident type: ${incidentTypeValue}`);
      throw "Invalid incident type"
  }
}

/**
 * Creates an Accident/Illness incident data object
 */
function getAccidentIllnessData(
  baseData: BaseIncidentReportData,
  specificData: Omit<AccidentIllnessIncidentData, keyof BaseIncidentReportData>
): AccidentIllnessIncidentData {
  return {
    ...baseData,
    ...specificData
  };
}

/**
 * Creates a Seizure incident data object
 */
function getSeizureData(
  baseData: BaseIncidentReportData,
  specificData: Omit<SeizureIncidentData, keyof BaseIncidentReportData>
): SeizureIncidentData {
  return {
    ...baseData,
    ...specificData
  };
}

/**
 * Creates a Behavior incident data object
 */
function getBehaviorData(
  baseData: BaseIncidentReportData,
  specificData: Omit<BehaviorIncidentData, keyof BaseIncidentReportData>
): BehaviorIncidentData {
  return {
    ...baseData,
    ...specificData
  };
}

 /**
   * Extracts the text content from an HTML anchor tag
   * @param html - HTML string containing an anchor tag
   * @returns The text content of the anchor tag or null if no anchor tag found
   */
  function extractAnchorText(html: string): string | null {
    // Regular expression to match content between opening and closing anchor tags
    const anchorRegex = /<a\s+[^>]*>(.*?)<\/a>/i;

    // Execute the regex against the input string
    const match = anchorRegex.exec(html);

    // Return the captured content or null if no match found
    return match ? match[1] : null;
  }

  function computeMarExceptionObject(e: Bluestep.Relate.RelationshipFormEntry) {
    return {
      name: e.fields.exception.val(), 
      value: e.id().shortId(),
      vitalsRequired: e.fields.vitalsReq.val(),
      noteRequired: e.fields.noteReq.val(),
      medDestruction: e.fields.medDestruct.val()
    };
  }