/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin APIs (Protected - requires JWT & Admin role)
 */

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Umar
 *               email:
 *                 type: string
 *                 example: umar@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: STUDENT
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched
 */

/**
 * @swagger
 * /api/admin/dashboard/recent-registrations:
 *   get:
 *     summary: Get recently registered users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent registrations list
 */

/**
 * @swagger
 * /api/admin/dashboard/classes-overview:
 *   get:
 *     summary: Get classes overview
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classes overview fetched
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/admin/users/email/{email}:
 *   get:
 *     summary: Get user by email
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */