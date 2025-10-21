-- Add Own Your Sale Program to Production Database
-- Run this SQL directly in Railway's PostgreSQL database

-- First, check if the program exists
DO $$
DECLARE
    program_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM "Programs" WHERE slug = 'own-your-sale') INTO program_exists;

    IF NOT program_exists THEN
        INSERT INTO "Programs" (
            id,
            title,
            slug,
            description,
            "longDescription",
            "instructorName",
            category,
            price,
            "discountPrice",
            currency,
            duration,
            "coverImage",
            "previewVideoUrl",
            tags,
            features,
            outcomes,
            lessons,
            resources,
            requirements,
            "isPublished",
            "isFeatured",
            "enrollmentCount",
            rating,
            "reviewCount",
            "createdAt",
            "updatedAt"
        ) VALUES (
            gen_random_uuid(),
            'Own Your Sale',
            'own-your-sale',
            'Master the art of sales with this comprehensive program designed for insurance and real estate professionals.',
            'Own Your Sale is a transformative program that equips you with the mindset, strategies, and tools to excel in sales. Whether you''re in insurance, real estate, or any sales-driven field, this program will help you:

• Build unshakeable confidence in your selling abilities
• Develop a systematic approach to prospecting and closing
• Master objection handling and negotiation techniques
• Create a personal brand that attracts ideal clients
• Implement proven follow-up systems that convert
• Cultivate the planted mind needed for consistent success

This isn''t just about techniques - it''s about owning your role as a sales professional and creating a business you''re proud of.',
            'Intentional Movement',
            'insurance',
            777.00,
            NULL,
            'USD',
            90,
            'https://via.placeholder.com/800x600/ec4899/ffffff?text=Own+Your+Sale',
            NULL,
            'sales,insurance,real-estate,business,mindset,confidence',
            '12 comprehensive modules covering all aspects of sales,Weekly live Q&A sessions with sales experts,Private community access for networking and support,Proven scripts and templates for prospecting and closing,Monthly accountability check-ins,Bonus: Personal branding masterclass,Lifetime access to all course materials',
            'Increased confidence in sales conversations,Systematic approach to generating and closing leads,Higher conversion rates and income,Sustainable business practices for long-term success,Strong personal brand that attracts clients,Resilient mindset that handles rejection with grace',
            '[{"id":1,"title":"Module 1: The Sales Mindset","description":"Develop the planted mind required for sales success","duration":45,"order":1,"videoUrl":null,"isPreview":true},{"id":2,"title":"Module 2: Know Your Value","description":"Understanding and communicating your unique value proposition","duration":60,"order":2,"videoUrl":null,"isPreview":false},{"id":3,"title":"Module 3: Prospecting Systems","description":"Build a consistent pipeline of qualified leads","duration":75,"order":3,"videoUrl":null,"isPreview":false},{"id":4,"title":"Module 4: The Consultation Process","description":"Master the art of discovery and needs assessment","duration":60,"order":4,"videoUrl":null,"isPreview":false},{"id":5,"title":"Module 5: Presenting Solutions","description":"Present your products/services with confidence and clarity","duration":55,"order":5,"videoUrl":null,"isPreview":false},{"id":6,"title":"Module 6: Objection Handling","description":"Turn objections into opportunities for deeper connection","duration":70,"order":6,"videoUrl":null,"isPreview":false},{"id":7,"title":"Module 7: Closing with Integrity","description":"Close deals while building long-term relationships","duration":65,"order":7,"videoUrl":null,"isPreview":false},{"id":8,"title":"Module 8: Follow-Up Mastery","description":"Implement systems that nurture relationships and drive sales","duration":50,"order":8,"videoUrl":null,"isPreview":false},{"id":9,"title":"Module 9: Building Your Brand","description":"Create a personal brand that attracts your ideal clients","duration":80,"order":9,"videoUrl":null,"isPreview":false},{"id":10,"title":"Module 10: Referral Systems","description":"Build a business that grows through client advocacy","duration":55,"order":10,"videoUrl":null,"isPreview":false},{"id":11,"title":"Module 11: Resilience & Rejection","description":"Develop mental toughness and bounce back from setbacks","duration":60,"order":11,"videoUrl":null,"isPreview":false},{"id":12,"title":"Module 12: Scaling Your Success","description":"Systemize and scale your sales business","duration":70,"order":12,"videoUrl":null,"isPreview":false}]',
            '[{"title":"Prospecting Scripts Library","type":"pdf","url":null},{"title":"Objection Handling Cheat Sheet","type":"pdf","url":null},{"title":"Follow-Up Email Templates","type":"pdf","url":null},{"title":"Personal Branding Workbook","type":"pdf","url":null},{"title":"Sales Tracker Spreadsheet","type":"spreadsheet","url":null}]',
            'Commitment to implement what you learn,Willingness to step out of your comfort zone,Notebook or digital device for taking notes,Active sales role or business (insurance, real estate, or related field recommended)',
            true,
            true,
            47,
            4.85,
            23,
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Own Your Sale program created successfully!';
    ELSE
        RAISE NOTICE 'Own Your Sale program already exists.';
    END IF;
END $$;
