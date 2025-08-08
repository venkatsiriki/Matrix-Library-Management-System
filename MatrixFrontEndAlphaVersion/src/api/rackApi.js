import { API_URL } from './config';

// Get all racks with their information
export const getAllRacks = async () => {
  try {
    const response = await fetch(`${API_URL}/racks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching racks:', error);
    throw error;
  }
};

// Get all rack assignments (books with their locations)
export const getAllRackAssignments = async () => {
  try {
    const response = await fetch(`${API_URL}/rack-assignments`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching rack assignments:', error);
    throw error;
  }
};

// Get books by department
export const getBooksByDepartment = async (department) => {
  try {
    const response = await fetch(`${API_URL}/rack-assignments?department=${encodeURIComponent(department)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching books by department:', error);
    throw error;
  }
};

// Get books by library
export const getBooksByLibrary = async (library) => {
  try {
    const response = await fetch(`${API_URL}/rack-assignments?library=${encodeURIComponent(library)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching books by library:', error);
    throw error;
  }
};

// Get books by rack
export const getBooksByRack = async (rack) => {
  try {
    const response = await fetch(`${API_URL}/rack-assignments`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const assignments = await response.json();
    return assignments.filter(assignment => assignment.rack === rack);
  } catch (error) {
    console.error('Error fetching books by rack:', error);
    throw error;
  }
};

// Get rack information by ID
export const getRackById = async (rackId) => {
  try {
    const response = await fetch(`${API_URL}/racks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const racks = await response.json();
    return racks.find(rack => rack.id === rackId);
  } catch (error) {
    console.error('Error fetching rack by ID:', error);
    throw error;
  }
};

// Get all departments
export const getAllDepartments = async () => {
  try {
    const assignments = await getAllRackAssignments();
    const departments = [...new Set(assignments.map(assignment => assignment.department))];
    return departments.filter(dept => dept); // Remove empty/null values
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Get all libraries
export const getAllLibraries = async () => {
  try {
    const assignments = await getAllRackAssignments();
    const libraries = [...new Set(assignments.map(assignment => assignment.library))];
    return libraries.filter(lib => lib); // Remove empty/null values
  } catch (error) {
    console.error('Error fetching libraries:', error);
    throw error;
  }
};

// Get rack capacity and usage
export const getRackCapacityInfo = async () => {
  try {
    const racks = await getAllRacks();
    return racks.map(rack => ({
      id: rack.id,
      capacity: rack.capacity,
      used: rack.used,
      available: rack.capacity - rack.used,
      department: rack.department,
      library: rack.library
    }));
  } catch (error) {
    console.error('Error fetching rack capacity info:', error);
    throw error;
  }
}; 