-- Insert daily content for the next 7 days
INSERT INTO daily_contents (id, date, contentType, title, message, mediaUrl, category, isActive, createdAt, updatedAt) VALUES
-- Today
('dc-001', date('now'), 'quote', 'Embrace Your Journey', 'Your body is your temple. Keep it pure and clean for the soul to reside in. Every movement is a step toward a stronger, healthier you.', NULL, 'motivation', 1, datetime('now'), datetime('now')),
-- Tomorrow
('dc-002', date('now', '+1 day'), 'tip', 'Morning Movement Routine', 'Start your day with 5 minutes of gentle stretching. Focus on your breath and set a positive intention for the day ahead.', NULL, 'wellness', 1, datetime('now'), datetime('now')),
-- Day 3
('dc-003', date('now', '+2 days'), 'challenge', '5-Minute Movement', 'Complete 5 minutes of non-stop movement today. Mix it up: jumping jacks, high knees, burpees, or dance!', NULL, 'fitness', 1, datetime('now'), datetime('now')),
-- Day 4
('dc-004', date('now', '+3 days'), 'affirmation', 'I Am Strong', 'I am strong, capable, and worthy of achieving my health goals. My body is amazing and I treat it with love.', NULL, 'mindfulness', 1, datetime('now'), datetime('now')),
-- Day 5
('dc-005', date('now', '+4 days'), 'reflection', 'Weekly Wins', 'What movements made you feel strongest this week? How can you incorporate more of what works for you?', NULL, 'growth', 1, datetime('now'), datetime('now')),
-- Day 6
('dc-006', date('now', '+5 days'), 'quote', 'Rise and Shine', 'The journey of a thousand miles begins with a single step. Today, take that step with intention and purpose.', NULL, 'motivation', 1, datetime('now'), datetime('now')),
-- Day 7
('dc-007', date('now', '+6 days'), 'tip', 'Hydration Habits', 'Aim for at least 8 glasses of water daily. Keep a water bottle with you and take sips throughout your workout.', NULL, 'wellness', 1, datetime('now'), datetime('now'));

-- Also add some past content for calendar view
INSERT INTO daily_contents (id, date, contentType, title, message, mediaUrl, category, isActive, createdAt, updatedAt) VALUES
('dc-past-001', date('now', '-1 day'), 'quote', 'Power of Progress', 'Your only limit is you. Be brave and fearless to know that you can do anything you put your mind to.', NULL, 'motivation', 1, datetime('now'), datetime('now')),
('dc-past-002', date('now', '-2 days'), 'challenge', 'Plank Progress', 'Hold a plank for 30 seconds longer than yesterday. Remember: straight line from head to heels!', NULL, 'fitness', 1, datetime('now'), datetime('now')),
('dc-past-003', date('now', '-3 days'), 'affirmation', 'My Body Is Capable', 'My body is an incredible machine that carries me through life. I honor it with movement and nourishment.', NULL, 'mindfulness', 1, datetime('now'), datetime('now'));