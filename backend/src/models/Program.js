const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Program = sequelize.define('Program', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructorName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Intentional Movement'
    },
    category: {
      type: DataTypes.ENUM('insurance', 'real-estate', 'personal-development', 'all-levels'),
      defaultValue: 'all-levels'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    duration: {
      type: DataTypes.INTEGER, // in days
      allowNull: true
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    previewVideoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.TEXT,
      defaultValue: '',
      get() {
        const value = this.getDataValue('tags');
        return value ? value.split(',').filter(Boolean) : [];
      },
      set(value) {
        this.setDataValue('tags', Array.isArray(value) ? value.join(',') : '');
      }
    },
    features: {
      type: DataTypes.TEXT,
      defaultValue: '',
      get() {
        const value = this.getDataValue('features');
        return value ? value.split(',').filter(Boolean) : [];
      },
      set(value) {
        this.setDataValue('features', Array.isArray(value) ? value.join(',') : '');
      }
    },
    outcomes: {
      type: DataTypes.TEXT,
      defaultValue: '',
      get() {
        const value = this.getDataValue('outcomes');
        return value ? value.split(',').filter(Boolean) : [];
      },
      set(value) {
        this.setDataValue('outcomes', Array.isArray(value) ? value.join(',') : '');
      }
    },
    lessons: {
      type: DataTypes.TEXT,
      defaultValue: null,
      get() {
        const value = this.getDataValue('lessons');
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue('lessons', JSON.stringify(value || []));
      }
    },
    resources: {
      type: DataTypes.TEXT,
      defaultValue: null,
      get() {
        const value = this.getDataValue('resources');
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue('resources', JSON.stringify(value || []));
      }
    },
    requirements: {
      type: DataTypes.TEXT,
      defaultValue: '',
      get() {
        const value = this.getDataValue('requirements');
        return value ? value.split(',').filter(Boolean) : [];
      },
      set(value) {
        this.setDataValue('requirements', Array.isArray(value) ? value.join(',') : '');
      }
    },
    stripePriceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripeProductId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    enrollmentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.TEXT,
      defaultValue: null
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['slug']
      },
      {
        fields: ['category']
      },
      {
        fields: ['isPublished']
      }
    ]
  });

  return Program;
};
