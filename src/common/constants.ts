export const openAPITags = {
	authentication: { name: "Authentication", basepath: "/api/auth" },
	user: {
		me: { name: "user", basepath: "/api/user/me" },
		all_users: { name: "user", basepath: "/api/user/" },
	},
	job: { name: "job", basepath: "/api/job" },
	job_request: {
		name: "Job Application  Request",
		basepath: "/api/job-request",
	},
	category: { name: "category", basepath: "/api/category" },
	location: { name: "location", basepath: "/api/location" },
	review: { name: "review", basepath: "/api/review" },
	payment: { name: "payment", basepath: "/api/payment" },
	setting: { name: "setting", basepath: "/api/setting" },
	common: { imag_upload: { name: "common", basepath: "/api/common/upload" } },

	admin: {
		auth: {
			name: "Admin - Authentication",
			basepath: "/api/admin/auth",
		},
		dashboard: {
			name: "Admin - Dashboard",
			basepath: "/api/admin/dashboard",
		},
		user_management: {
			name: "Admin - User Management",
			basepath: "/api/admin/users",
		},
		job_management: {
			name: "Admin - Job Management",
			basepath: "/api/admin/jobs",
		},
		payment_management: {
			name: "Admin - Payment Management",
			basepath: "/api/admin/payments",
		},
		setting_management: {
			name: "Admin - Settings",
			basepath: "/api/admin/settings",
		},
	},
};

export const mediaTypeFormat = {
	json: "application/json",
	form: "multipart/form-data",
};
