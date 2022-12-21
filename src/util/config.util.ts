import path from 'path';
import fs from 'fs';

const integrationRolesPath = path.join(__dirname, '../../config', 'integration-roles.json');
const integrationRoles = JSON.parse(fs.readFileSync(integrationRolesPath, 'utf8'));

export {integrationRoles};
