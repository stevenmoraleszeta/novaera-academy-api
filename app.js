const express = require('express');
require('dotenv').config();
const cors = require('cors');
const passport = require('passport');
require('./passport');

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

const modalityRoutes = require('./routes/modalities');
app.use('/api/modalities', modalityRoutes);

const categoriesRoutes = require('./routes/categories');
app.use('/api/categories', categoriesRoutes);

const rolesRoutes = require('./routes/roles');
app.use('/api/roles', rolesRoutes);

const projectStatusesRoutes = require('./routes/projectStatuses');
app.use('/api/project-statuses', projectStatusesRoutes);

const coursesRoutes = require('./routes/courses');
app.use('/api/courses', coursesRoutes);

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

// students route 
const studentsRoutes = require('./routes/students');
app.use('/api/students', studentsRoutes);

const studentProfilesRoutes = require('./routes/studentProfiles');
app.use('/api/student-profiles', studentProfilesRoutes);

const mentorsRoutes = require('./routes/mentors');
app.use('/api/mentors', mentorsRoutes);

const studentCoursesRoutes = require('./routes/studentCourses');
app.use('/api/student-courses', studentCoursesRoutes);

const projectsRoutes = require('./routes/projects');
app.use('/api/projects', projectsRoutes);

const studentProjectsRoutes = require('./routes/studentProjects');
app.use('/api/student-projects', studentProjectsRoutes);

const modulesRoutes = require('./routes/modules');
app.use('/api/modules', modulesRoutes);

const recordingsRoutes = require('./routes/recordings');
app.use('/api/recordings', recordingsRoutes);

const featuresRoutes = require('./routes/features');
app.use('/api/features', featuresRoutes);

const courseFeaturesRoutes = require('./routes/courseFeatures');
app.use('/api/course-features', courseFeaturesRoutes);

const classRoutes = require('./routes/classes');
app.use('/api/classes', classRoutes);

const classResourcesRoutes = require('./routes/classesResources');
app.use('/api/class-resources', classResourcesRoutes);

const loginRoutes = require('./routes/auth');
app.use('/api/auth', loginRoutes);

const paymentsRoutes = require('./routes/payments');
app.use('/api/payments', paymentsRoutes);

const completedClassesRoutes = require('./routes/completedClasses');
app.use('/api/users', completedClassesRoutes);

const googleAuthRouter = require('./routes/googleAuth');
app.use('/auth', googleAuthRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});