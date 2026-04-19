/**
 * @swagger
 * tags:
 *   name: Teacher
 *   description: Teacher APIs (Protected - requires JWT)
 */

/**
 * @swagger
 * /api/teacher/profile:
 *   put:
 *     summary: Update teacher profile (name, password)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /api/teacher/classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - semesterNumber
 *               - semester
 *               - subjectName
 *               - sections
 *             properties:
 *               semesterNumber:
 *                 type: number
 *               semester:
 *                 type: string
 *               subjectName:
 *                 type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 */

/**
 * @swagger
 * /api/teacher/classes:
 *   get:
 *     summary: Get all classes of logged-in teacher
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 */

/**
 * @swagger
 * /api/teacher/verify-student:
 *   get:
 *     summary: Verify student by email
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student found
 *       404:
 *         description: Student not found
 */

/**
 * @swagger
 * /api/teacher/classes/{classId}/students:
 *   post:
 *     summary: Add student to class
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentEmail
 *               - studentName
 *               - rollNo
 *               - section
 *             properties:
 *               studentEmail:
 *                 type: string
 *               studentName:
 *                 type: string
 *               rollNo:
 *                 type: string
 *               section:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student added successfully
 */

/**
 * @swagger
 * /api/teacher/classes/{classId}/students:
 *   get:
 *     summary: Get all students of a class
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Students list
 */

/**
 * @swagger
 * /api/teacher/classes/{classId}/students/{studentId}:
 *   delete:
 *     summary: Remove student from class
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student removed
 */

/**
 * @swagger
 * /api/teacher/classes/{classId}/attendance:
 *   post:
 *     summary: Mark attendance manually
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - records
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2026-04-18"
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: Present
 *     responses:
 *       201:
 *         description: Attendance saved
 */

/**
 * @swagger
 * /api/teacher/classes/{classId}/attendance/mark-all:
 *   post:
 *     summary: Mark all students present/absent
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - status
 *             properties:
 *               date:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: Present
 *     responses:
 *       201:
 *         description: All attendance marked
 */

/**
 * @swagger
 * /api/teacher/classes/{classId}/attendance:
 *   get:
 *     summary: Get attendance by date
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance data
 */

/**
 * @swagger
 * /api/teacher/classes/{classId}/attendance-summary:
 *   get:
 *     summary: Get overall student attendance summary
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance summary
 */