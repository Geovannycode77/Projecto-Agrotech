<?php
// session_start();
// include 'db.php';

// if (!isset($_SESSION['username'])) {
//     header("Location: index.php");
//     exit();
// }

$thread_id = $_GET['thread_id'];
$username = $_SESSION['username'];

// Fetch thread information
$query = "SELECT title, content, created_by FROM threads WHERE thread_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $thread_id);
$stmt->execute();
$thread_result = $stmt->get_result();
$thread = $thread_result->fetch_assoc();
$stmt->close();

// Fetch comments for the thread
$comment_query = "SELECT comment_id, content, created_by FROM comments WHERE thread_id = ? ORDER BY created_at ASC";
$stmt = $conn->prepare($comment_query);
$stmt->bind_param("i", $thread_id);
$stmt->execute();
$comments_result = $stmt->get_result();
$stmt->close();

// Handle new comment submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['comment'])) {
    $comment_content = $_POST['comment'];
    $comment_stmt = $conn->prepare("INSERT INTO comments (thread_id, content, created_by) VALUES (?, ?, ?)");
    $comment_stmt->bind_param("iss", $thread_id, $comment_content, $username);
    $comment_stmt->execute();
    $comment_stmt->close();

    header("Location: view-thread.php?thread_id=" . $thread_id);
    exit();
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">


    <link rel="stylesheet" href="../css/styles.css"> <!-- Link to your custom CSS -->
    <title>FarmSafe</title>
</head>
<style>
        .comment-box {
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #f9f9f9;
        }
        .comment-author {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .comment-content {
            margin-bottom: 10px;
        }
        .reply-button {
            background-color: #28a745;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 5px;
        }
        .reply-button:hover {
            background-color: #218838;
        }
        .comment-form {
            display: none;
            margin-top: 20px;
        }
    </style>
<body>
<header>
        <nav class="navbar navbar-expand-lg fixed-top">
            <div class="container-fluid">
                <a class="navbar-brand logo me-auto" href="#">FarmSafe</a>
                <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title logo" id="offcanvasNavbarLabel">FarmSafe</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <ul class="navbar-nav justify-content-center flex-grow-1 pe-3">
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z content-font2" aria-current="page"
                                    href="home.php">Home</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="resources.php">Library</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="vaccination.php">Vaccination</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="disease-info.php">Disease</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="report-disease.php">Report</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z  content-font2" aria-current="page" href="Forum.php">Forum</a>
                            </li>
                            <li class="nav-item me-3">
                                <a class="nav-link mx-lg-z content-font2" href="about.php">About</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <form action="home.php" method="POST"><input class="login-button content-font2" style="border: solid 0px;" type="submit" name="logout" value="LogOut"></input></form>

                <button class="navbar-toggler pe-0" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
    </header>
    <div style="margin-top:120px;"  class="container">
        <!-- Thread Info -->
        <div class="thread-header mb-4">
            <h1 ><?php echo htmlspecialchars($thread['title']); ?></h1>
            <p class="text-muted">Posted by <?php echo htmlspecialchars($thread['created_by']); ?></p>
            <p class="lead"><?php echo nl2br(htmlspecialchars($thread['content'])); ?></p>
        </div>

        <!-- Button to Add Comment -->
        <div>
            <button class="btn btn-primary thread-button" id="addCommentBtn">Add Comment</button>
        </div>

        <!-- Comment Form (hidden by default) -->
        <div class="comment-form" id="commentForm">
            <form method="POST" action="view-thread.php?thread_id=<?php echo $thread_id; ?>">
                <textarea name="comment" class="form-control" rows="4" required></textarea>
                <button type="submit" class="btn btn-success mt-3">Post Comment</button>
            </form>
        </div>

        <!-- Comments Section -->
        <h2 class="mt-4">Comments</h2>
        <div class="comments-section">
            <?php if ($comments_result->num_rows > 0): ?>
                <?php while ($comment = $comments_result->fetch_assoc()): ?>
                    <div class="comment-box">
                        <div class="comment-author"><?php echo htmlspecialchars($comment['created_by']); ?></div>
                        <div class="comment-content"><?php echo nl2br(htmlspecialchars($comment['content'])); ?></div>
                        <button class="reply-button" data-bs-toggle="collapse" data-bs-target="#reply-<?php echo $comment['comment_id']; ?>">Comment</button>
                        <div class="collapse mt-3" id="reply-<?php echo $comment['comment_id']; ?>">
                            <form method="POST" action="view-thread.php?thread_id=<?php echo $thread_id; ?>">
                                <textarea name="comment" class="form-control" rows="3" required></textarea>
                                <button type="submit" class="btn btn-success mt-2">Post Reply</button>
                            </form>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <p>No comments yet. Be the first to comment!</p>
            <?php endif; ?>
        </div>

    </div>

    <!-- Bootstrap JS (optional, for collapsible reply forms) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- JavaScript to toggle the comment form -->
    <script>
        document.getElementById('addCommentBtn').addEventListener('click', function() {
            const commentForm = document.getElementById('commentForm');
            // Toggle visibility of the comment form
            if (commentForm.style.display === 'none' || commentForm.style.display === '') {
                commentForm.style.display = 'block';
            } else {
                commentForm.style.display = 'none';
            }
        });
    </script>
        <footer style="background-color: #132e2e;"  class="text-white pt-5 pb-4">

<div class="container text-left text-md-left">
    <div  class="row text-left text-md-left">
        <div class="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
            <h5 class="mb-4 " style="font-family: Playwrite GB S, cursive;">FarmSafe</h5>
            <p>
                Explore detailed disease guides, track vaccination schedules, report outbreaks, and join a
                community forum designed for farmers, veterinarians, and agricultural students to promote
                healthier livestock management.
            </p>
        </div>
        <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5>Links</h5>
            <p>
                <a class="text-white" style="text-decoration: none;" href="#">Forum</a>
            </p>
            <p>
                <a class="text-white" style="text-decoration: none;" href="#">Report</a>
            </p>
            <p>
                <a class="text-white" style="text-decoration: none;" href="#">About</a>
            </p>
            <p>
                <a class="text-white" style="text-decoration: none;" href="#">Article</a>
            </p>
        </div>

        <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
            <h5>Contact</h5>
            <p>
                <i class="fas fa-home mr-3"> Windhoek, NUST, Namibia</i>
                <i class="fas fa-envelope mr-3"> farmsafe@gmail.com</i>
                <i class="fas fa-phone mr-3">+264 200 000</i>
                <i class="fas fa-print mr-3">+264 300 000</i>
            </p>
        </div>
    </div>
    <hr class="mb-4">
    <div class="row align-items-center">
        <div class="col-md-7 col-lg-8">
            <p>Copyrights ©2024 All rights reserved by: <strong
                    style="font-family: Playwrite GB S, cursive;">FarmSafe</strong></p>
        </div>
    </div>
</div>

</footer>
</body>
</html>
