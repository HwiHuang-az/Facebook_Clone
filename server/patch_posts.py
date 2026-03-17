import os

file_path = "d:/Duan/Facebook_Clone/server/routes/posts.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Shared post inclusion block
shared_post_block = """        {
          model: Post,
          as: 'sharedPost',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
            }
          ]
        }"""

# Replacement 1: Newsfeed
old_block_1 = """        {
          model: Like,
          as: 'likes',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }"""

if old_block_1 in content:
    new_content = content.replace(old_block_1, old_block_1 + ",\n" + shared_post_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully patched posts.js")
else:
    # Try with \r\n
    old_block_1_rn = old_block_1.replace('\\n', '\\r\\n') # AI string has literal \n
    # Correction: internal python strings use \n.
    old_block_1_rn = old_block_1.replace('\n', '\r\n')
    if old_block_1_rn in content:
        shared_post_block_rn = shared_post_block.replace('\n', '\r\n')
        new_content = content.replace(old_block_1_rn, old_block_1_rn + ",\r\n" + shared_post_block_rn)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully patched posts.js (with \\r\\n)")
    else:
        print("Could not find old_block_1 in content")
        idx = content.find("model: Like")
        if idx != -1:
            print(f"Sample content around 'model: Like': {repr(content[idx:idx+100])}")
        else:
            print("Could not even find 'model: Like'")
