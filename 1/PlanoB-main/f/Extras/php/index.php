<?php 

    

?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="../css/styles.css"> <!-- Link to your custom CSS -->
    <title>FarmSafe - Login</title>
</head>

<style>
    body {
        background-image: url('../images/horse-6724544_1280.jpg'); /* Corrected background image path */
        background-size: cover; 
        background-position: center; 
        background-repeat: no-repeat;
    }

    p {
        font-family: Roboto;
        color: white;
    }

    label {
        color: white;
    }

    .passwordLink {
        display: block;
        text-align: right;
        color: rgb(100, 100, 100);
    }

    .passwordLink:hover {
        text-decoration: underline;
        color: rgb(160, 160, 160);
    }
</style>

<body>
    <!-- Register button -->
    <div class="mt-2 container" style="text-align: right;">
        <a href="register.php"><button type="button" class="btn btn-outline-info">REGISTER</button></a>
    </div>

    <!-- Display error message if there is one -->
    <?php if (!empty($errorMessage)): ?>
        <div class="alert alert-danger text-center mt-3" role="alert">
            <?php echo htmlspecialchars($errorMessage); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Login form -->
    <div class="d-flex flex-column vh-100 justify-content-center align-items-center">
        <div class="container custom-container px-5 pt-5 rounded" style="background-color: rgba(0, 0, 0, 0.555)">
            <div class="row text-center">
                <div class="col">
                    <h1 class="logo">FarmSafe</h1>
                    <p>Preventing Disease, Protecting Livestock</p>
                </div>
            </div>

            <!-- Form -->
            <div class="row text-left">
                <form id="login-form" method="POST" action="index.php">
                    <!-- Email input -->
                    <div class="mb-3 text-left">
                        <label for="email" class="form-label">Email</label>
                        <!-- Added 'name' attribute for email input -->
                        <input type="email" class="form-control" id="email" name="email" aria-describedby="emailHelp" placeholder="Your email" required>
                    </div>

                    <!-- Password input -->
                    <div class="mb-3 text-left">
                        <label for="password" class="form-label">Password</label>
                        <!-- Added 'name' attribute for password input -->
                        <input type="password" class="form-control" id="password" name="password" placeholder="Your password" required>
                    </div>

                    <!-- Submit button and Forgot Password link -->
                    <div class="row">
                        <div class="col-6 ">
                            <div class="mb-3"><input class="btn btn-primary w-100" type="submit" value="Login"></div>
                        </div>
                        <div class="col-6">
                            <!-- Updated Forgot Password link -->
                            <a class="passwordLink" href="../html/forgot-password.php">Forgot Password?</a>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <p class="text-center">© FarmSafe, Inc. 2024</p>
        </div>
    </div>

    <!-- Scripts -->
    <script src="../js/script.js"></script> <!-- Link to JavaScript file -->
    <script src='https://code.jquery.com/jquery-3.5.1.slim.min.js'></script> <!-- Include jQuery for Bootstrap JS -->
    <script src='https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js'></script> <!-- Include Popper.js for Bootstrap JS -->
    <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js' integrity='sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz' crossorigin='anonymous'></script>

</body>
</html>
