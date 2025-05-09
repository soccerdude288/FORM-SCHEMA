/// <reference path="../../../scriptlibrary" />
import { StaffObject, StaffProfileObject, ResidentObject, ResidentProfileObject, ResidentMarObject, MarObject, ResidentAdlObject, AdlObject, ResidentBehObject, BehObject, ResidentGoalObject, GoalObject, LocationsObject, ClientObject } from './interfaces'
import { getMarData, getIncidentReportData } from './payloadFunctions'
//const body = JSON.parse(B.net.request.content());
//declare const residentId;
//const thisResId = residentId == null ? 0 : residentId;
//const globalRes = allResThisUnitDown.optById(`1000002___${thisResId}`); //.orElseThrow(() => { throw "Could not find resident" });
const curDate = B.time.Instant.now().truncatedTo(B.time.ChronoUnit.DAYS)
const dateFmtr = B.time.DateTimeFormatter.ofPattern("M/d/y");

export function getStaffProfile(staffId): StaffObject[] {
  const rtn: StaffObject[] = []
  const staff = allActiveStaffThisUnitDown.optById(`1000002___${staffId}`).orElseThrow(() => { throw "Could not find staff" });
  const { fullName } = staff.forms.name.fields
  rtn.push({ label: fullName.val(), id: staff.id().shortId(), unit: staff.unit().id().shortId() })
  return rtn
}

// export function getResidentInfo(form, stDate, endDate) {

// }

export function getResidentProfile(residentId) {
  const clientTime: Array<ClientObject> = [];
  const incidentArr: Object[] = []
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  const { name, contactInfo, clientInfo, adls, MAR, supportStrategies, medicationPrompts, tempWarn } = res.forms
  const { fullName, prefFull, email, photo } = name.fields
  const { mPhone } = contactInfo.fields
  const { birthdate, age, gender } = clientInfo.fields
  res.forms.clientTime.addSearch("stTime", ">=", curDate)
  // res.forms.clientTime.addSearch("stTime", "<=", curDate)
  res.forms.clientTime.forEach(time => {
    const { stTime, stSig, endTime, endSig, address, city, state, zip, estHours, estMinutes, mileage, comments, locInLatitude, locInLongitude, locationIn, locOutLatitude, locOutLongitude, locationOut } = time.fields
    clientTime.push({
      version: time.version(), id: time.id().shortId(),
      stSig: stSig.timeStamp(), stTime: stTime.val(), endSig: endSig.timeStamp(), endTime: endTime.val(), address: address.val(), city: city.val(), state: state.val(), zip: zip.val(),
      estHours: estHours.val(), estMinutes: estMinutes.val(), mileage: mileage.val(), comments: comments.val(), locationIn: locationIn.val(), locationOut: locationOut.val()
    })
  })
  res.forms.incidentReport.addSearch("dateTime", "<=", B.time.LocalDateTime.now().plusDays(1).format(dateFmtr))
  res.forms.incidentReport.addSearch("dateTime", ">=", B.time.LocalDateTime.now().minusDays(5).format(dateFmtr))
  res.forms.incidentReport.forEach(incident => {
    incidentArr.push(getIncidentReportData(incident));
  })
  // let {totalAdls, compAdls}: number = 0
  let totalAdls: number = 0
  let compAdls: number = 0
  let totalMars: number = 0
  let compMars: number = 0
  let totalGoals: number = 0
  let compGoals: number = 0
  adls.addSearch("servDate", "=", curDate)
  adls.addSearch("schedTime", "NONE", "PRN")
  // .adls.addSearch("servDate", "<=", curDateEnd)
  adls.forEach(adl => {
    console.log(`ADL ${adl.id().shortId()}: ${adl.fields.staffSig.timeStamp()}`);
    totalAdls = totalAdls + 1
    if (adl.fields.staffSig.timeStamp()) {
      compAdls = compAdls + 1
    }
  })
  console.log(`Searching for MARs with date ${B.time.ZonedDateTime.now()}`);
  MAR.addSearch("date", "=", curDate)
  MAR.addSearch("schedAdmin", "NONE", 'PRN')
  // MAR.addSearch("date", "<=", curDateEnd)
  MAR.forEach(mar => {
    console.log(`MAR ${mar.id().shortId()}: ${mar.fields.adminSig.timeStamp()}`)
    totalMars = totalMars + 1
    if (mar.fields.adminSig.timeStamp()) {
      console.log("MAR completed")
      compMars = compMars + 1
    }
  })
  supportStrategies.addSearch("date", "=", curDate)
  supportStrategies.addSearch("schedTime", "NONE", "PRN")
  // supportStrategies.addSearch("date", "<=", curDateEnd)
  supportStrategies.forEach(support => {
    console.log(`Support ${support.id().shortId()}: ${support.fields.sig.timeStamp()}`);
    totalGoals = totalGoals + 1
    if (support.fields.sig.timeStamp()) {
      compGoals = compGoals + 1
    }
  })
  const totals = {
    totalAdls: totalAdls,
    compAdls: compAdls,
    totalMars: totalMars,
    compMars: compMars,
    totalGoals: totalGoals,
    compGoals: compGoals
  }
  const { alert, booContra, textContra, booAllergy, textAllergy } = medicationPrompts.fields
  const { boo1, text1, boo2, text2, boo3, text3, boo4, text4, boo5, text5, antiRes, antiText, by, temp } = tempWarn.fields
  const medPromptObject = {
    version: medicationPrompts.version(),
    id: medicationPrompts.id().shortId(),
    alert: alert.val(),
    contraBool: booContra.val(),
    contraMed: textContra.val(),
    allergyBool: booAllergy.val(),
    allergyText: textAllergy.val()
  }
  const resProfileUrl = `${B.org.defaultDomain() + res.viewUrl()}`
  const warningObject = {
    version: tempWarn.version(),
    id: tempWarn.id().shortId(),
    alert: tempWarn.fields.alert.val(),
    boo1: boo1.val(),
    text1: text1.val(),
    boo2: boo2.val(),
    text2: text2.val(),
    boo3: boo3.val(),
    text3: text3.val(),
    boo4: boo4.val(),
    text4: text4.val(),
    boo5: boo5.val(),
    text5: text5.val(),
    antiRes: antiRes.val(),
    antiText: antiText.val(),
    by: by.val(),
    temp: temp.val()
  }

  return {
    id: res.id().shortId(), url: resProfileUrl, label: fullName.val(), prefFull: prefFull?.val(), photo: photo.mergeTag(), gender: gender.val(),
    unit: res.unit().id().shortId(), email: email?.val(), phone: mPhone?.val(), birthday: birthdate.val()?.toString(), age: age?.val(),
    clientTime: clientTime, incident: incidentArr, totals: totals, medicationPrompts: medPromptObject, warnings: warningObject
  };
}

export function createClientTimeEntry(residentId) : MEFR_clientTime {
  const body = JSON.parse(B.net.request.content());
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  const clientTime = res.forms.clientTime.newEntry();
  const { stTime, stSig, endTime, endSig, address, city, state, zip, estHours, estMinutes, mileage, comments, locInLatitude, locInLongitude, locationIn, locOutLatitude, locOutLongitude, locationOut } = clientTime.fields
  stTime.val(B.time.ZonedDateTime.parse(body.stTime));
  stSig.lock()?.rowUnlock(stSig);
  stSig.sign(B.time.Instant.now().toEpochMilli());
  endTime.val(B.time.ZonedDateTime.parse(body.endTime))
  endSig.lock()?.rowUnlock(endSig);
  endSig.sign(B.time.Instant.now().toEpochMilli());
  address.val(body.address);
  city.val(body.city);
  state.val(body.state);
  zip.val(body.zip);
  estHours.val(body.estHours);
  estMinutes.val(body.estMinutes);
  mileage.val(body.mileage);
  comments.val(body.comments);
  locationIn.val(body.locationIn);
  locationOut.val(body.locationOut);
  B.commit()
  return clientTime;
}

export function createIncidentReport(residentId) {
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  const incReport = res.forms.incidentReport.newEntry()
  const { incType, reportedBy, dateTime, where, whereOther, whoPresent, staffInvolved, behaviorMulti, antecedent, incDesc, checkAllIncDesc,
    suddenIllness, physicalAppearanceChange, outcome, checkAllOutcome, firstAid, specifyFirstAid, didYouWitnessSeizure, whenDidSeizureHappen,
    timeLast, beforeSeizure, triggers, patientAbleToTalk, eyesDuringSeizure, noticeableBodyMovements, lossBowelCont, repeatedMovements,
    recoveryAfter, weakOrNumb, doesPatientRemember, timeUntilResume, physAgroToOthers, physicalAggression, verbalAggression, offensiveBeh, sib,
    refusalOfPrograms, awol, sexualBeh, isolation, sleeping, obsessiveBeh, preincident, descript, after, facts, adminSig } = incReport.fields
  if (body.incType === 'aii') {
    incType.setByExportValue('aii')
    reportedBy.val(body.reportedBy)
    dateTime.val(B.time.ZonedDateTime.parse(body.dateTime))
    where.setByName(body.where)
    whoPresent.setMultiple(body.whoPresent)
    behaviorMulti.setMultiple(body.behaviorMulti)
    antecedent.val(body.antecedent)
    incDesc.val(body.incDesc)
    checkAllIncDesc.setMultiple(body.checkAllIncDesc)
    suddenIllness.setMultiple(body.suddenIllness)
    physicalAppearanceChange.setMultiple(body.physicalAppearanceChange)
    outcome.val(body.outcome)
    firstAid.val(body.firstAid)
    specifyFirstAid.val(body.speficyFirstAid)
    adminSig.sign(B.time.Instant.now().toEpochMilli())
  } else if (body.incType === 'seizure') {
    incType.setByExportValue('seizure')
  } else if (body.incType === 'behavior') {
    incType.setByExportValue('behavior')
  }
}

export function getResidentMars(residentId) : Array<ResidentMarObject> {
  const rtn: Array<ResidentMarObject> = [];
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  res.forms.MAR.addSearch("date", "=", B.time.ZonedDateTime.now())
  // res.forms.MAR.addSearch("date", "<", B.time.ZonedDateTime.now().plusDays(2))
  // res.forms.MAR.addSort("date")
  res.forms.MAR.forEach(mar => {
    rtn.push(getMarData(mar));
  })
  return rtn;
}

export function updateMarEntry(residentId, marId) : MEFR_MAR {
  const body = JSON.parse(B.net.request.content());
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  const mar = res.forms.MAR.optById(`1000201___${marId}_1115023`).orElseThrow(() => { throw "Could not find mar" });
  const { date, medName, dosage, schedAdmin, comments, note, adminEx, qtyAdministered, adminTime, adminSig } = mar.fields
  note.val(body.notes)
  adminEx.setByName(body.exception)
  qtyAdministered.val(body.quantity)
  adminTime.val(B.time.ZonedDateTime.parse(body.date))
  adminSig.lock()?.rowUnlock(adminSig);
  adminSig.sign(B.time.Instant.now().toEpochMilli());
  B.commit()
  return mar
}

export function getResidentAdls(residentId) : Array<ResidentAdlObject>  {
  const rtn: Array<ResidentAdlObject> = [];
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  res.forms.adls.addSearch("servDate", "=", B.time.ZonedDateTime.now())
  // res.forms.adls.addSearch("servDate", "<", B.time.ZonedDateTime.now().plusDays(2))
  res.forms.adls.addSort("servDate")
  res.forms.adls.forEach(adl => {
    const { servDate, servItem, inst, adlNote, exception, schedTime, staffSig, LOA } = adl.fields
    rtn.push({
      version: adl.version(), id: adl.id().shortId(),
      date: servDate.val()?.format(B.time.DateTimeFormatter.ofPattern('MM/dd/YYYY')), label: servItem.val(), instructions: inst.val(),
      notes: adlNote.val(), assistance: LOA.selected()[0].displayName(), exceptions: exception.activeOptions().map(e => e.displayName()),
      adminTime: schedTime.selectedOptions()[0].displayName(), signature: staffSig.timeStamp(), toileting: "", sleep: ""
    })
  })
  return rtn;
}

export function updateAdlEntry(residentId, adlId) : MEFR_adls {
  const body = JSON.parse(B.net.request.content());
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  const adl = res.forms.adls.optById(`1000201___${adlId}_1115023`).orElseThrow(() => { throw "Could not find adl" });
  const { adlNote, exception, staffSig, LOA } = adl.fields
  adlNote.val(body.notes)
  exception.setByName(body.exception)
  staffSig.lock()?.rowUnlock(staffSig);
  staffSig.sign(B.time.Instant.now().toEpochMilli());
  B.commit()
  return adl
}

export function getResidentBehs(residentId) : Array<ResidentBehObject> {
  const rtn: Array<ResidentBehObject> = [];
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  res.forms.behPlan.addSearch("date", "=", B.time.ZonedDateTime.now())
  // res.forms.behPlan.addSearch("date", "<", B.time.ZonedDateTime.now().plusDays(2))
  res.forms.behPlan.addSort("date")
  res.forms.behPlan.forEach(beh => {
    const { date } = beh.fields
    rtn.push({
      version: beh.version(), id: beh.id().shortId(),
      date: date.val()?.format(B.time.DateTimeFormatter.ofPattern('MM/dd/YYYY'))
    })
  })
  return rtn;
}

export function updateBehEntry(residentId, behId) : MEFR_behOccurrence {
  const body = JSON.parse(B.net.request.content());
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  const beh = res.forms.behOccurrence.optById(`1000201___${behId}_1115023`).orElseThrow(() => { throw "Could not find behhavior" });
  return beh
}

export function getResidentGoals(residentId) : Array<ResidentGoalObject> {
  const rtn: Array<ResidentGoalObject> = [];
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  res.forms.supportStrategies.addSearch("date", "=", B.time.ZonedDateTime.now())
  // res.forms.supportStrategies.addSearch("date", "<", B.time.ZonedDateTime.now().plusDays(1))
  res.forms.supportStrategies.addSort("date")
  res.forms.supportStrategies.forEach(goal => {
    const { date, goalRel, supportStrat, instructions, notes, exception, schedTime, clientCompletion, sig } = goal.fields
    rtn.push({
      version: goal.version(), id: goal.id().shortId(),
      label: goalRel.val()[0].fields.goal.val(), instructions: instructions.val(), notes: notes.val(),
      supportStrat: supportStrat.options().map(c => c.name()), exception: exception.activeOptions().map(c => c.displayName()),
      date: date.val()?.format(B.time.DateTimeFormatter.ofPattern('MM/dd/YYYY')), schedTime: schedTime.selectedOptions()[0].displayName(),
      completion: clientCompletion.val(), staffSig: sig.user()
    })
  })
  return rtn;
}

export function updateGoalEntry(residentId, goalId) : MEFR_supportStrategies {
  const body = JSON.parse(B.net.request.content());
  const res = allResThisUnitDown.optById(`1000002___${residentId}`).orElseThrow(() => { throw "Could not find resident" });
  const goal = res.forms.supportStrategies.optById(`1000201___${goalId}_1115023`).orElseThrow(() => { throw "Could not find goal" });
  const { date, goalRel, supportStrat, instructions, notes, exception, schedTime, clientCompletion, sig } = goal.fields
  return goal
}