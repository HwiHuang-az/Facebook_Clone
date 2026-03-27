const fs = require('fs');
const path = require('path');

const commentControllerPath = path.join(__dirname, 'controllers', 'commentController.js');
let content = fs.readFileSync(commentControllerPath, 'utf8');

// Add distinct: true to getPostComments
content = content.replace(
  /order: \[\['createdAt', 'ASC'\]\]\n    \}\);/g,
  "order: [['createdAt', 'ASC']],\n      distinct: true\n    });"
);

// Second attempt with different whitespace if needed
content = content.replace(
  /order: \[\['createdAt', 'ASC'\]\]\r?\n\s+\}\);/g,
  "order: [['createdAt', 'ASC']],\n      distinct: true\n    });"
);

fs.writeFileSync(commentControllerPath, content);
console.log('✅ Updated commentController.js');

const pageControllerPath = path.join(__dirname, 'controllers', 'pageController.js');
let pageContent = fs.readFileSync(pageControllerPath, 'utf8');

// Fix getPageMembers order
pageContent = pageContent.replace(
  /order: \[\['createdAt', 'DESC'\]\]\r?\n\s+\}\);/g,
  "order: [['created_at', 'DESC']]\n    });"
);

fs.writeFileSync(pageControllerPath, pageContent);
console.log('✅ Updated pageController.js');
