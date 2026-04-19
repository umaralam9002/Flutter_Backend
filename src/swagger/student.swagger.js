/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student APIs (Protected - requires JWT)
 */

/**
 * @swagger
 * /api/student/profile:
 *   get:
 *     summary: Get logged-in student profile
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/student/profile:
 *   put:
 *     summary: Update student password
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Password required
 */

/**
 * @swagger
 * /api/student/classes:
 *   get:
 *     summary: Get all enrolled classes with attendance summary
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes with attendance stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       classId:
 *                         type: string
 *                       subjectName:
 *                         type: string
 *                       semester:
 *                         type: string
 *                       semesterNumber:
 *                         type: number
 *                       sections:
 *                         type: array
 *                         items:
 *                           type: string
 *                       teacherId:
 *                         type: string
 *                       rollNo:
 *                         type: string
 *                       section:
 *                         type: string
 *                       totalLectures:
 *                         type: number
 *                       presentCount:
 *                         type: number
 *                       absentCount:
 *                         type: number
 *                       percentage:
 *                         type: number
 *                       attendedDates:
 *                         type: array
 *                         items:
 *                           type: string
 */

/**
 * @swagger
 * /api/student/classes/{classId}/attendance:
 *   get:
 *     summary: Get attendance history for a specific class
 *     tags: [Student]
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
 *         description: Attendance history with summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalLectures:
 *                       type: number
 *                     presentCount:
 *                       type: number
 *                     absentCount:
 *                       type: number
 *                     percentage:
 *                       type: number
 *                     attendedDates:
 *                       type: array
 *                       items:
 *                         type: string
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           status:
 *                             type: string
 */

/**
 * @swagger
 * /api/student/attendance:
 *   get:
 *     summary: Get attendance across all classes
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All classes attendance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       classId:
 *                         type: string
 *                       subjectName:
 *                         type: string
 *                       semester:
 *                         type: string
 *                       semesterNumber:
 *                         type: number
 *                       teacherId:
 *                         type: string
 *                       rollNo:
 *                         type: string
 *                       section:
 *                         type: string
 *                       totalLectures:
 *                         type: number
 *                       presentCount:
 *                         type: number
 *                       absentCount:
 *                         type: number
 *                       percentage:
 *                         type: number
 *                       history:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             date:
 *                               type: string
 *                             status:
 *                               type: string
 */