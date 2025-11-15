// apiService.js
// Servicio para manejar todas las peticiones a MockAPI

// ⚠️ REEMPLAZA ESTAS URLs con las de TUS proyectos en MockAPI
const API_BASE_URL_1 = 'https://6914d9e73746c71fe049d586.mockapi.io'; // users y rooms
const API_BASE_URL_2 = 'https://6914ead03746c71fe04a079f.mockapi.io'; // reservations

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

/**
 * Maneja los errores de las peticiones HTTP
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error ${response.status}: ${error}`);
  }
  return response.json();
};

/**
 * Realiza una petición HTTP genérica
 * @param {string} baseUrl - URL base del proyecto MockAPI
 * @param {string} endpoint - Endpoint específico (ej: /users)
 * @param {object} options - Opciones de la petición (method, body, etc)
 */
const request = async (baseUrl, endpoint, options = {}) => {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
};

// ==============================================
// USUARIOS (users)
// ==============================================

export const userService = {
  /**
   * Obtiene todos los usuarios
   */
  getAll: async () => {
    return await request(API_BASE_URL_1, '/users');
  },

  /**
   * Obtiene un usuario por ID
   */
  getById: async (id) => {
    return await request(API_BASE_URL_1, `/users/${id}`);
  },

  /**
   * Busca un usuario por email
   */
  getByEmail: async (email) => {
    const users = await request(API_BASE_URL_1, '/users');
    return users.find(user => user.email === email);
  },

  /**
   * Crea un nuevo usuario
   */
  create: async (userData) => {
    return await request(API_BASE_URL_1, '/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Actualiza un usuario existente
   */
  update: async (id, userData) => {
    return await request(API_BASE_URL_1, `/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Elimina un usuario
   */
  delete: async (id) => {
    return await request(API_BASE_URL_1, `/users/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Cambia la contraseña de un usuario
   */
  changePassword: async (id, newPassword) => {
    return await request(API_BASE_URL_1, `/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ password: newPassword })
    });
  }
};

// ==============================================
// HABITACIONES (rooms)
// ==============================================

export const roomService = {
  /**
   * Obtiene todas las habitaciones
   */
  getAll: async () => {
    return await request(API_BASE_URL_1, '/rooms');
  },

  /**
   * Obtiene habitaciones disponibles
   */
  getAvailable: async () => {
    const rooms = await request(API_BASE_URL_1, '/rooms');
    return rooms.filter(room => room.disponible === true);
  },

  /**
   * Obtiene una habitación por ID
   */
  getById: async (id) => {
    return await request(API_BASE_URL_1, `/rooms/${id}`);
  },

  /**
   * Crea una nueva habitación
   */
  create: async (roomData) => {
    return await request(API_BASE_URL_1, '/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  },

  /**
   * Actualiza una habitación existente
   */
  update: async (id, roomData) => {
    return await request(API_BASE_URL_1, `/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    });
  },

  /**
   * Elimina una habitación
   */
  delete: async (id) => {
    return await request(API_BASE_URL_1, `/rooms/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Cambia la disponibilidad de una habitación
   */
  toggleAvailability: async (id, disponible) => {
    return await request(API_BASE_URL_1, `/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ disponible })
    });
  }
};

// ==============================================
// RESERVAS (reservations)
// ==============================================

export const reservationService = {
  /**
   * Obtiene todas las reservas
   */
  getAll: async () => {
    return await request(API_BASE_URL_2, '/reservations');
  },

  /**
   * Obtiene una reserva por ID
   */
  getById: async (id) => {
    return await request(API_BASE_URL_2, `/reservations/${id}`);
  },

  /**
   * Obtiene reservas de un usuario específico
   */
  getByUserId: async (userId) => {
    const reservations = await request(API_BASE_URL_2, '/reservations');
    return reservations.filter(res => res.userId === userId);
  },

  /**
   * Obtiene reservas de una habitación específica
   */
  getByRoomId: async (roomId) => {
    const reservations = await request(API_BASE_URL_2, '/reservations');
    return reservations.filter(res => res.roomId === roomId);
  },

  /**
   * Crea una nueva reserva
   */
  create: async (reservationData) => {
    return await request(API_BASE_URL_2, '/reservations', {
      method: 'POST',
      body: JSON.stringify({
        ...reservationData,
        estado: reservationData.estado || 'pendiente'
      })
    });
  },

  /**
   * Actualiza una reserva existente
   */
  update: async (id, reservationData) => {
    return await request(API_BASE_URL_2, `/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reservationData)
    });
  },

  /**
   * Cambia el estado de una reserva
   */
  changeStatus: async (id, estado) => {
    return await request(API_BASE_URL_2, `/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ estado })
    });
  },

  /**
   * Cancela una reserva (cambia estado a "cancelada")
   */
  cancel: async (id) => {
    return await request(API_BASE_URL_2, `/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: 'cancelada' })
    });
  },

  /**
   * Elimina una reserva
   */
  delete: async (id) => {
    return await request(API_BASE_URL_2, `/reservations/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Obtiene estadísticas de reservas por estado
   */
  getStatsByStatus: async () => {
    const reservations = await request(API_BASE_URL_2, '/reservations');
    const stats = {
      pendiente: 0,
      confirmada: 0,
      cancelada: 0,
      completada: 0
    };

    reservations.forEach(res => {
      if (stats.hasOwnProperty(res.estado)) {
        stats[res.estado]++;
      }
    });

    return stats;
  }
};

// ==============================================
// EXPORTACIÓN POR DEFECTO (opcional)
// ==============================================

export default {
  users: userService,
  rooms: roomService,
  reservations: reservationService
};