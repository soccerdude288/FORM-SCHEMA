/// <reference path="../../../scriptlibrary" />
export interface StaffObject {
    label: string;
    id: string;
    unit: string;
  }
  
  export interface StaffProfileObject extends StaffObject {
    prefFull: string;
    email: string;
    phone: string;
    birthday: Java.Time.LocalDate | null;
    age: number | null;
  }
  
  export interface ResidentObject {
    label: string;
    id: string;
    photo: any;
    unit: string;
  }
  
  export interface ResidentProfileObject extends ResidentObject {
    prefFull: string;
    url: string;
    email: string;
    phone: string;
    birthday: string | undefined;
    age: number | null;
    clientTime: any;
    medicationPrompts: any;
    warnings: any;
  }
  
  export interface MarObject {
    label: string;
    id: string;
    unit: string;
    mar: Array<ResidentMarObject>
  }
  
  export interface ResidentMarObject {
    version: string;
    id: string;
    label: Bluestep.EList<Bluestep.Relate.RelationshipFormEntry>;
    dosage: string;
    schedAdmin: string;
    instructions: string;
    notes: string;
    exceptions: Bluestep.EList<Bluestep.Relate.OptionItem>;
    quantity: number | null;
    date: typeof Java.Time.ZonedDateTime;
    adminTime: Java.Time.ZonedDateTime | null;
    signature: Java.Time.Instant | null;
  }
  
  export interface ResidentAdlObject {
    version: string;
    id: string;
    label: string;
    instructions: string;
    notes: string;
    assistance: Bluestep.EList<Bluestep.Relate.OptionItem>;
    exceptions: string[];
    date: Java.Time.ZonedDateTime | null;
    adminTime: Java.Time.ZonedDateTime | null;
    signature: Java.Time.Instant | null;
    toileting: string | null;
    sleep: string | null;
  }
  
  export interface AdlObject {
    label: string
    id: string;
    unit: string;
    adl: Array<ResidentAdlObject>
  }
  
  export interface ResidentBehObject {
    version: string;
    id: string;
    date: Java.Time.ZonedDateTime | null;
  }
  
  export interface BehObject {
    label: string;
    id: string;
    unit: string;
    beh: Array<ResidentBehObject>
  }
  
  export interface ResidentGoalObject {
    version: string;
    id: string;
    label: Bluestep.EList<Bluestep.Relate.RelationshipFormEntry>;
    supportStrat: Bluestep.EList<Bluestep.Relate.RelationshipFormEntry>;
    instructions: string;
    notes: string;
    exception: string[];
    date: Java.Time.ZonedDateTime | null;
    schedTime: Java.Time.ZonedDateTime | null
    completion: boolean | null;
    staffSig: Bluestep.User | null;
  }
  
  export interface GoalObject {
    label: string;
    id: string;
    unit: string;
    goal: Array<ResidentGoalObject>;
  }
  
  export interface ClientObject {
    version: string;
    id: string;
    stSig: Java.Time.Instant | null;
    stTime: Java.Time.ZonedDateTime | null;
    endSig: Java.Time.Instant | null;
    endTime: Java.Time.ZonedDateTime | null;
    estHours: number | null;
    estMinutes: number | null;
    mileage: number | null;
    comments: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    locationIn: string;
    locationOut: string;
  }
  
  export interface LocationsObject {
    label: string;
    version: string;
    id: string;
    unit: string;
  }
  
  export interface Data {
    collections: Collections;
    // data: Array<Event>;
  }
  
  export interface Event {
    apptStatus: string;
    cli_id: string;
    color: string;
    end_date: string;
    event_type: string;
    id: string;
    isCheckIn: boolean;
    isDeleted: boolean;
    noteToClient: string;
    notes: string;
    prov_id: string;
    sendNotes: boolean;
    serv_id: string;
    staff_text: string;
    start_date: string;
    statusIcon: string;
    text: string;
  }
  
  
  interface EventData {
    collections: Collections;
    // data: Array<Event>;
  }
  
  interface Collections {
    staff: Array<StaffObject>;
    residents: Array<ResidentObject>;
    locations: Array<LocationsObject>;
    calendar: Array<Object>
  }
  
  export interface HomeObject {
    shiftChangeNotes: ShiftChangeNoteObject[];
    nursingNotes: NursingNotesObject[];
    behaviorOccurances: BehOccuranceObject[];
    incidentReports: IncidentReportObject[];
    progress: Object
  }
  
  export interface ShiftChangeNoteObject {
    version: string;
    id: string;
    date: Java.Time.ZonedDateTime;
    noteType: string;
    title: string;
    note: string;
    sig: string;
  }
  
  export interface NursingNotesObject {
    version: string;
    id: string;
    stDate: Java.Time.LocalDate | null;
    endDate: Java.Time.LocalDate | null;
  }
  
  export interface BehOccuranceObject {
    version: string;
    id: string;
    occurDate: Java.Time.LocalDate | null;
  }
  
  export interface IncidentReportObject {
    version: string;
    id: string;
    incType: Bluestep.Relate.OptionItem | string;
    reportedBy: string;
    dateTime: Java.Time.ZonedDateTime | null;
    where: Bluestep.EList<Bluestep.Relate.OptionItem> | string[];
    whoPresent: string[];
    behaviorMulti?: string[];
    adminSig: Bluestep.User | string | null;
  }

  // Common fields shared across all incident report types
  export interface BaseIncidentReportData {
    version: string;
    id: string;
    incType: string;
    reportedBy: string;
    dateTime: any; // Using 'any' here as the source seems to use different field types
    where: string[];
    whoPresent: string[];
    behaviorMulti?: string[];
    adminSig: any;
  }

  // Specific fields for Accident/Illness Incidents
  export interface AccidentIllnessIncidentData extends BaseIncidentReportData {
    antecedent: string;
    descript: string;
    incDescriptionCheck: string[];
    sickness: string[];
    physicalAppearanceChange: string[];
    outcome: string;
    outcomeCheck: string[];
    firstAid: boolean;
    firstAidNote: string;
  }

  // Specific fields for Seizure Incidents
  export interface SeizureIncidentData extends BaseIncidentReportData {
    witnessSeizure: string;
    seizureDateTime: any;
    seizureLength: string;
    beforeSeizure: string;
    triggers: string;
    patientTalk: string;
    eyes: string;
    bodyMovements: string;
    bowelControl: string;
    repeatedMovements: string;
    recovery: string;
    weakNumb: string;
    patientRemember: string;
    timeUntilFunction: string;
  }

  // Specific fields for Behavior Incidents
  export interface BehaviorIncidentData extends BaseIncidentReportData {
    physAgrotoOthers: string[];
    physicalAggression: string[];
    verbalAggression: string[];
    offensiveBeh: string[];
    sib: string[];
    refulaoOfPrograms: string[];
    awol: string[];
    sexualBeh: string[];
    isolation: string[];
    sleeping: string[];
    obsessiveBeh: string[];
    preIncident: string;
    description: string;
    after: string;
    facts: string;
  }

  // Union type for all incident report types
  export type IncidentReportData =
    | AccidentIllnessIncidentData
    | SeizureIncidentData
    | BehaviorIncidentData;