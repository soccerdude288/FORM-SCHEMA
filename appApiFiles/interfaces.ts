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
    birthday: LocalDate | null;
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
    label: EList<RelationshipFormEntry>;
    dosage: string;
    schedAdmin: string;
    instructions: string;
    notes: string;
    exceptions: EList<OptionItem>;
    quantity: number | null;
    date: typeof ZonedDateTime;
    adminTime: ZonedDateTime | null;
    signature: Instant | null;
  }
  
  export interface ResidentAdlObject {
    version: string;
    id: string;
    label: string;
    instructions: string;
    notes: string;
    assistance: EList<OptionItem>;
    exceptions: string[];
    date: ZonedDateTime | null;
    adminTime: ZonedDateTime | null;
    signature: Instant | null;
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
    date: ZonedDateTime | null;
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
    label: EList<RelationshipFormEntry>;
    supportStrat: EList<RelationshipFormEntry>;
    instructions: string;
    notes: string;
    exception: string[];
    date: ZonedDateTime | null;
    schedTime: ZonedDateTime | null
    completion: boolean | null;
    staffSig: User | null;
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
    stSig: Instant | null;
    stTime: ZonedDateTime | null;
    endSig: Instant | null;
    endTime: ZonedDateTime | null;
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
    date: DateTimeField;
    noteType: string;
    title: string;
    note: string;
    sig: string;
  }
  
  export interface NursingNotesObject {
    version: string;
    id: string;
    stDate: LocalDate | null;
    endDate: LocalDate | null;
  }
  
  export interface BehOccuranceObject {
    version: string;
    id: string;
    occurDate: LocalDate | null;
  }
  
  export interface IncidentReportObject {
    version: string;
    id: string;
    incType: OptionItem;
    reportedBy: string;
    dateTime: ZonedDateTime | null;
    where: EList<OptionItem>;
  }