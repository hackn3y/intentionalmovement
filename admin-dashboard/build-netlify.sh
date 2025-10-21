#!/bin/bash
# Netlify build script for admin dashboard
# Sets CI=false to allow ESLint warnings without failing the build

export CI=false
npm run build
