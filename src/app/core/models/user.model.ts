/**
 * User model representing the core user data
 * This model is optimized for SSO integration
 */
export interface User {
  // Core user data
  id: string;              // Primary key, typically from Auth0
  email: string;           // Primary email address
  name?: string;           // Full name
  firstName?: string;      // First name
  lastName?: string;       // Last name
  picture?: string;        // Profile picture URL

  // Authentication data
  emailVerified: boolean;  // Whether the email has been verified
  lastLogin?: Date;        // Last login timestamp
  createdAt: Date;         // When the user was first created
  updatedAt: Date;         // When the user record was last updated
  
  // JWT Authentication
  token?: string;          // JWT access token for API authentication
  tokenExpires?: Date;     // Expiration date of the token
  refreshToken?: string;   // Refresh token for obtaining new access tokens

  // SSO-specific data
  organizationId?: string; // ID of the organization the user belongs to
  usesSSO: boolean;        // Whether the user authenticates via SSO

  // Application-specific data
  role: string;            // User's role in the system (passed as string from backend)
  permissions?: string[];  // Specific permissions granted to the user
  metadata?: any;          // Additional user metadata (preferences, settings)

  // Enterprise data
  department?: string;     // User's department
  workTeam?: string;       // User's specific team within the department (e.g., "Energy Management" within "Facilities")
  jobTitle?: string;       // User's job title
  employeeId?: string;     // Organization's employee ID
  location?: string;       // User's office location
  
  // Financial tracking
  payRate?: number;        // Hourly pay rate for cost tracking
  currency?: string;       // Currency code (default: USD)
  costCenter?: string;     // Cost center or budget code
  
  // Vehicle information
  vehicle?: EmployeeVehicleSimple; // Simplified vehicle information for employees who have one
}

/**
 * Simplified employee vehicle information focused on essential tracking
 */
export interface EmployeeVehicleSimple {
  // Basic identifiers
  id?: string;                 // Unique identifier for the vehicle
  make: string;                // Vehicle manufacturer (e.g., Ford, Toyota)
  model: string;               // Vehicle model (e.g., F-150, Camry)
  year: number;                // Model year
  licensePlate: string;        // License plate number
  vin?: string;                // Vehicle Identification Number
  
  // Financial tracking essentials
  isCompanyOwned: boolean;     // Whether the vehicle is company-owned
  mileageRate?: number;        // Reimbursement rate per mile
  currentMileage?: number;     // Current odometer reading
  assetId?: string;            // Asset tracking ID in company system
  
  // Basic compliance and documentation
  insuranceExpiration?: Date;  // Insurance expiration date
  registrationExpiration?: Date; // Registration expiration date
  
  // Optional detailed information
  vehicle?: EmployeeVehicle;   // Full detailed vehicle information (if needed)
}

/**
 * Employee vehicle information for tracking costs, mileage, and maintenance
 * This is the comprehensive version for advanced users who need detailed tracking
 */
export interface EmployeeVehicle {
  // Basic vehicle information
  make: string;           // Vehicle manufacturer (e.g., Ford, Toyota)
  model: string;          // Vehicle model (e.g., F-150, Camry)
  year: number;           // Model year
  licensePlate: string;   // License plate number
  vin: string;            // Vehicle Identification Number
  color?: string;         // Vehicle color
  type?: string;          // Vehicle type (sedan, truck, SUV, etc.)
  trim?: string;          // Vehicle trim level (LX, EX, Limited, etc.)
  engineType?: string;    // Engine details (V6, 4-cylinder, electric, etc.)
  transmission?: string;  // Transmission type (automatic, manual, CVT)
  driveType?: string;     // Drive type (FWD, RWD, AWD, 4WD)
  
  // Dimensions and capacity
  capacity?: number;      // Passenger capacity
  cargoCapacity?: number; // Cargo capacity in cubic feet/volume
  maxPayload?: number;    // Maximum payload capacity in pounds
  towingCapacity?: number; // Maximum towing capacity in pounds
  
  // Tracking
  initialMileage?: number;      // Starting odometer reading
  currentMileage?: number;      // Current odometer reading
  lastUpdatedMileage?: Date;    // When mileage was last updated
  purchaseDate?: Date;          // When the vehicle was purchased/leased
  leaseEndDate?: Date;          // End date for leased vehicles
  insurancePolicy?: string;     // Insurance policy number
  insuranceProvider?: string;   // Insurance company name
  insuranceExpiration?: Date;   // Insurance expiration date
  registrationExpiration?: Date; // Registration expiration date
  inspectionExpiration?: Date;  // State inspection expiration date
  assignmentHistory?: VehicleAssignment[]; // History of employee assignments
  
  // Maintenance
  lastServiceDate?: Date;       // Last maintenance service date
  nextServiceDate?: Date;       // Next scheduled maintenance
  maintenanceHistory?: VehicleMaintenance[]; // History of repairs and services
  maintenanceSchedule?: VehicleMaintenanceSchedule; // Planned maintenance schedule
  warrantyEndDate?: Date;       // Warranty expiration date
  warrantyMileage?: number;     // Warranty mileage limit
  recalls?: VehicleRecall[];    // Any active recalls
  
  // Financial
  fuelType?: string;            // Type of fuel used (gasoline, diesel, electric)
  fuelCapacity?: number;        // Fuel tank capacity in gallons
  averageMpg?: number;          // Average miles per gallon
  purchasePrice?: number;       // Purchase price or lease terms
  currentValue?: number;        // Estimated current value
  depreciation?: number;        // Annual depreciation rate
  mileageRate?: number;         // Reimbursement rate per mile
  monthlyAllowance?: number;    // Monthly vehicle allowance amount
  monthlyLeaseCost?: number;    // Monthly lease payment amount
  yearlyTaxes?: number;         // Annual taxes and registration fees
  yearlyInsuranceCost?: number; // Annual insurance cost
  isCompanyOwned?: boolean;     // Whether the vehicle is company-owned
  assetId?: string;             // Asset tracking ID in company system
  
  // Operational data
  primaryLocation?: string;     // Primary garage/parking location
  keyLocation?: string;         // Where keys are kept or key code
  fuelCardNumber?: string;      // Fuel card number assigned to vehicle
  ezPassId?: string;            // Toll pass ID
  gpsUnit?: string;             // GPS tracking unit ID
  telematics?: VehicleTelematicsData; // Connected vehicle data
  
  // Compliance
  isApprovedForPersonalUse?: boolean; // Whether approved for personal use
  requiresCDL?: boolean;        // Whether requires commercial driver's license
  odometerImageUrl?: string;    // Image URL of current odometer reading
  lastInspectionResult?: string; // Result of last safety inspection
}

/**
 * Vehicle maintenance record
 */
export interface VehicleMaintenance {
  // Basic information
  id: string;                  // Unique identifier for the maintenance record
  date: Date;                  // Date of service
  mileage: number;             // Odometer reading at service
  type: string;                // Type of service (oil change, tire rotation, repair)
  description: string;         // Detailed description of work done
  isRoutine: boolean;          // Whether this was routine maintenance or repair
  isWarrantyCovered?: boolean; // Whether this was covered under warranty
  
  // Financial information
  cost: number;                // Cost of service
  laborCost?: number;          // Labor cost component
  partsCost?: number;          // Parts cost component
  taxAmount?: number;          // Tax amount
  
  // Service details
  provider: string;            // Service provider/mechanic
  technicianName?: string;     // Technician who performed the service
  workOrderNumber?: string;    // Work order or invoice number
  partsReplaced?: string[];    // List of parts replaced
  fluidsAdded?: Record<string, number>; // Fluids added (type and amount)
  
  // Documentation
  receiptImage?: string;       // Receipt image URL
  workOrderImage?: string;     // Work order image URL
  notes?: string;              // Additional notes
  
  // Follow-up
  nextServiceMileage?: number; // Mileage for next recommended service
  nextServiceDate?: Date;      // Date for next recommended service
  issuesIdentified?: string[]; // Issues identified for future attention
}

/**
 * Vehicle assignment history
 */
export interface VehicleAssignment {
  employeeId: string;          // ID of employee assigned to vehicle
  employeeName: string;        // Name of employee assigned to vehicle
  startDate: Date;             // Start date of assignment
  endDate?: Date;              // End date of assignment (if applicable)
  purpose: string;             // Purpose of assignment
  initialMileage: number;      // Mileage at start of assignment
  finalMileage?: number;       // Mileage at end of assignment
  condition?: string;          // Vehicle condition notes
}

/**
 * Vehicle maintenance schedule
 */
export interface VehicleMaintenanceSchedule {
  oilChangeMileage: number;    // Miles between oil changes
  oilChangeMonths: number;     // Months between oil changes
  tireRotationMileage: number; // Miles between tire rotations
  brakeMileage: number;        // Miles between brake inspections
  tuneUpMileage: number;       // Miles between tune-ups
  transmissionMileage: number; // Miles between transmission service
  customIntervals?: Record<string, number>; // Custom maintenance intervals
}

/**
 * Vehicle recall information
 */
export interface VehicleRecall {
  recallId: string;            // Recall identification number
  issueDate: Date;             // When recall was issued
  description: string;         // Description of the recall issue
  severity: string;            // Severity level of recall
  isResolved: boolean;         // Whether recall has been addressed
  resolvedDate?: Date;         // When recall was resolved
  serviceProvider?: string;    // Who performed the recall service
}

/**
 * Vehicle telematics data
 */
export interface VehicleTelematicsData {
  deviceId: string;            // Telematics device ID
  installDate: Date;           // When device was installed
  lastReport?: Date;           // Last data report received
  avgDailyMileage?: number;    // Average daily mileage
  avgFuelEconomy?: number;     // Average fuel economy from telemetry
  harshBrakingEvents?: number; // Number of harsh braking events
  speedingEvents?: number;     // Number of speeding events
  idlingTime?: number;         // Total idling time in minutes
  diagnosticCodes?: string[];  // Any diagnostic trouble codes reported
}

/**
 * User roles for the LNYQE application
 * These values are for reference only, as roles are passed as strings from the backend
 */
export enum UserRole {
  ADMIN = 'admin',
  FACILITY_MANAGER = 'facility_manager',
  STAFF = 'staff',
  GUEST = 'guest'
}


