const { Comment } = require('./models');

async function checkCycles() {
  try {
    const comments = await Comment.findAll({ attributes: ['id', 'parentCommentId'] });
    const graph = {};
    comments.forEach(c => {
      graph[c.id] = c.parentCommentId;
    });
    
    for (const id in graph) {
      let curr = graph[id];
      const visited = new Set([id]);
      while (curr) {
        if (visited.has(String(curr))) {
          console.error(`Cycle detected! Comment ${id} is in a cycle with ${curr}`);
          process.exit(1);
        }
        visited.add(String(curr));
        curr = graph[curr];
      }
    }
    
    console.log('✅ No cycles detected in comments');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkCycles();
