-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Create CR for CSE Batch 57 Section A
INSERT INTO users (name, email, role, token_id, department, batch_id, section_id)
SELECT 
  'Abdullah Rahman', 
  'abdullah@pciu.ac.bd', 
  'cr', 
  'CRCSE57A', 
  'CSE',
  b.id,
  s.id
FROM batches b
JOIN sections s ON s.batch_id = b.id
WHERE b.batch_name = 'Batch 57' 
  AND b.department = 'CSE'
  AND s.section_name = 'A';

-- Create CR for CSE Batch 58 Section B
INSERT INTO users (name, email, role, token_id, department, batch_id, section_id)
SELECT 
  'Fatima Khan', 
  'fatima@pciu.ac.bd', 
  'cr', 
  'CRCSE58B', 
  'CSE',
  b.id,
  s.id
FROM batches b
JOIN sections s ON s.batch_id = b.id
WHERE b.batch_name = 'Batch 58' 
  AND b.department = 'CSE'
  AND s.section_name = 'B';

-- Sample Schedules for CSE Batch 57 Section A
INSERT INTO schedules (room_id, course_name, course_code, teacher_name, department, day_of_week, time_slot_id, batch_id, section_id, created_by)
SELECT 
  (SELECT id FROM rooms WHERE room_name = '301' LIMIT 1),
  'Data Structures',
  'CSE201',
  'Dr. Ahmed Hassan',
  'CSE',
  'Sunday',
  1,
  b.id,
  s.id,
  (SELECT id FROM users WHERE token_id = 'CRCSE57A' LIMIT 1)
FROM batches b
JOIN sections s ON s.batch_id = b.id
WHERE b.batch_name = 'Batch 57' 
  AND b.department = 'CSE'
  AND s.section_name = 'A';

INSERT INTO schedules (room_id, course_name, course_code, teacher_name, department, day_of_week, time_slot_id, batch_id, section_id, created_by)
SELECT 
  (SELECT id FROM rooms WHERE room_name = '301L' LIMIT 1),
  'Data Structures Lab',
  'CSE201L',
  'Engr. Mahmud Hasan',
  'CSE',
  'Monday',
  1,
  b.id,
  s.id,
  (SELECT id FROM users WHERE token_id = 'CRCSE57A' LIMIT 1)
FROM batches b
JOIN sections s ON s.batch_id = b.id
WHERE b.batch_name = 'Batch 57' 
  AND b.department = 'CSE'
  AND s.section_name = 'A';

INSERT INTO schedules (room_id, course_name, course_code, teacher_name, department, day_of_week, time_slot_id, batch_id, section_id, created_by)
SELECT 
  (SELECT id FROM rooms WHERE room_name = '305' LIMIT 1),
  'Database Management',
  'CSE301',
  'Prof. Karim Abdullah',
  'CSE',
  'Sunday',
  2,
  b.id,
  s.id,
  (SELECT id FROM users WHERE token_id = 'CRCSE57A' LIMIT 1)
FROM batches b
JOIN sections s ON s.batch_id = b.id
WHERE b.batch_name = 'Batch 57' 
  AND b.department = 'CSE'
  AND s.section_name = 'A';

-- Verify
SELECT 
  u.name AS cr_name,
  b.batch_name,
  s.section_name,
  COUNT(sch.id) AS total_classes
FROM users u
JOIN batches b ON u.batch_id = b.id
JOIN sections s ON u.section_id = s.id
LEFT JOIN schedules sch ON sch.batch_id = b.id AND sch.section_id = s.id
WHERE u.role = 'cr'
GROUP BY u.name, b.batch_name, s.section_name;