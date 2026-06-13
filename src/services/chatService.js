import api from "../api/axiosInstance";

export const obtenerMensajesChat = (codigoOt) => api.get(`/api/chat/ot/${codigoOt}`);
export const enviarMensajeChat   = (codigoOt, contenido) => api.post(`/api/chat/ot/${codigoOt}`, { contenido });