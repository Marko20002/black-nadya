import { adminApi, publicApi } from './client';

// ---- Public (read-only) ----

export const getProducts = (params) => publicApi.get('/products/', { params }).then((r) => r.data);
export const getProduct = (slug) => publicApi.get(`/products/${slug}/`).then((r) => r.data);
export const getCategories = () => publicApi.get('/categories/').then((r) => r.data);
export const getPharmacies = () => publicApi.get('/pharmacies/').then((r) => r.data);
export const getSiteSettings = () => publicApi.get('/site-settings/').then((r) => r.data);
export const submitOrderRequest = (payload) => publicApi.post('/order-requests/', payload).then((r) => r.data);
export const submitContactMessage = (payload) => publicApi.post('/contact-messages/', payload).then((r) => r.data);

// ---- Admin (authenticated CRUD) ----

function toFormData(data) {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      form.append(key, value);
    } else if (typeof value === 'object' && !(value instanceof File)) {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, value);
    }
  });
  return form;
}

function makeCrud(path, { multipart = false } = {}) {
  const base = `/admin/${path}/`;
  return {
    list: (params) => adminApi.get(base, { params }).then((r) => r.data),
    get: (id) => adminApi.get(`${base}${id}/`).then((r) => r.data),
    create: (data) =>
      adminApi
        .post(base, multipart ? toFormData(data) : data, multipart ? undefined : {})
        .then((r) => r.data),
    update: (id, data) =>
      adminApi
        .patch(`${base}${id}/`, multipart ? toFormData(data) : data)
        .then((r) => r.data),
    remove: (id) => adminApi.delete(`${base}${id}/`),
  };
}

export const adminProducts = makeCrud('products', { multipart: true });
export const adminCategories = makeCrud('categories');
export const adminPharmacies = makeCrud('pharmacies');
export const adminOrderRequests = makeCrud('order-requests');
export const adminContactMessages = makeCrud('contact-messages');

export const adminSiteSettings = {
  get: () => adminApi.get('/admin/site-settings/').then((r) => r.data),
  update: (data) => adminApi.patch('/admin/site-settings/', toFormData(data)).then((r) => r.data),
};

export const getCurrentUser = () => adminApi.get('/auth/me/').then((r) => r.data);
