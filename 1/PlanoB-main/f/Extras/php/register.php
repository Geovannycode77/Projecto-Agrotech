<?php 

    if($_SERVER['REQUEST_METHOD'] === 'POST'){
        $username = $_POST['username'];
        $email = $_POST['email'];
        $password = $_POST['password'];
        $confirm_password = $_POST['confirm_password'];

        $err_message = '';

        if(any_empty_field()){
            $err_message = "Please, complete all fields";
        }

        if(!is_username_valid($username)){
            $err_message = "Username contains invalid charecters";
        }

        if(!is_email_valid($email)){
            $err_message = "Invalid email";
        }

        if(does_username_exist($username)){
            $err_message = "Username already in use";
        }

        if(does_email_exist($email)){
            $err_message = "Email already in use";
        }
    }


    function database_connection(){
        include 'db.php';
        return $conn; 
    }


    function any_empty_field(){
        
        if(empty($GLOBALS['username'])){
            return true;
        }
        elseif(empty($GLOBALS['email'])){
            return true;
        }
        elseif(empty($GLOBALS['password'])){
            return true;
        }
        elseif(empty($GLOBALS['confirm_password'])){
            return true;
        }

    }

    function validate_field(){
        $pattern = '/[^a-zA-Z0-9_]/'; 
        $message_err = '';

        if(preg_match($pattern, $GLOBALS['username'])){
                $message_err = 'Username contains invalid charecters';
        }
        elseif(!filter_var($GLOBALS['email'], FILTER_VALIDATE_EMAIL)){
            $message_err = 'Invalid email';
        }

        return $message_err;
    }

    function is_username_valid($username){
        $pattern = '/[^a-zA-Z0-9_]/';

        if(preg_match($pattern, $username)){
            return false;
        }
        return true;
    }

    function is_email_valid($email){
        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
            return false;
        }
        return true;
    }

    function validate_password(){
        $message_err = '';

        if(strlen($GLOBALS['password']) > 20 || strlen($GLOBALS['password']) < 8 ){
            $message_err = 'Password must be between 8 to 20 charecters';
        }
        elseif($GLOBALS['password'] !== $GLOBALS['confirm_password']){
            $message_err = "Passwords don't match";
        }

        return $message_err;
    }

    function does_username_exist($username){
        try{    
            $conn = database_connection();
            $get_username_query = "SELECT COUNT(*) FROM users WHERE username = ?";
            $result = $conn->prepare($get_username_query);
            $result->execute([$username]);
            $number_of_rows = $result->fetchColumn();
            
            return $number_of_rows > 0;
        }catch(PDOException $e){
            error_log("Database error: " . $e->getMessage());
            return null; 
        }
    }

    function does_email_exist($email){
        try{
            $conn = database_connection();
            $get_email_query = "SELECT COUNT(*) FROM users WHERE email = ?";
            $result = $conn->prepare($get_email_query);
            $result->execute([$email]);
            $number_of_rows = $result->fetchColumn();

            return $number_of_rows > 0;
        }catch(PDOException $e){
            error_log("Database error " . $e->getMessage());
            return null;
        }
    }

    function store_user($username, $email, $password){

    }

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="../css/styles.css"> <!-- Link to your custom CSS -->
    <title>FarmSafe - Register</title>
</head>

<style>
    body {
        background-image: url('../images/sheeps-3437467_1280.jpg'); /* Corrected background image path */
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

    .custom-container {
        background-color: rgba(0, 0, 0, 0.555); 
    }

    @media (min-width: 576px) {
        .custom-container {
            max-width: 500px;
        }
    }
    @media (min-width: 768px) {
        .custom-container {
            max-width: 500px;
        }
    }
    @media (min-width: 992px) {
        .custom-container {
            max-width: 500px; 
        }
    }
    @media (min-width: 1200px) {
        .custom-container {
            max-width: 600px;
        }
    }
</style>

<body>
    <!-- Login button -->
    <div class="mt-2 container" style="text-align: right;">
        <a href="index.php"><button type="button" class="btn btn-outline-info">LOGIN</button></a>
    </div>

    <!-- Registration Form -->
    <div class="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <div class="container custom-container px-5 pt-5 rounded">
            <div class="row text-center">
                <div class="col">
                    <h1 class="logo">FarmSafe</h1>
                    <p>Preventing Disease, Protecting Livestock</p>
                </div>
            </div>
            <?php if(!empty($err_message)): ?>
                <div class="warning">
                    <span class="alert-text"><?php echo htmlspecialchars($err_message, ENT_QUOTES, 'UTF-8'); ?></span>
                    <i class="fa fa-close alert-icon" onclick="this.parentElement.style.display='none'" style="font-size:20px"></i>
                </div>
            <?php endif; ?>
            <?php if(!empty($message)): ?>
                <div class="warning">
                    <span class="alert-text"><?php echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?></span>
                    <i class="fa fa-close alert-icon" onclick="this.parentElement.style.display='none'" style="font-size:20px"></i>
                </div>
            <?php endif; ?>
            <!-- Form -->
            <div class="row text-left">
                <div class="col">
                    <form id="register-form" method="POST" action="register.php">
                        <span ></span>
                        <!-- Username input -->
                        <div class="mb-3 text-left">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username" name="username" placeholder="Your username" >
                        </div>

                        <!-- Email input -->
                        <div class="mb-3 text-left">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" name="email" placeholder="Your email" >
                        </div>

                        <!-- Password input -->
                        <div class="mb-3 text-left">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password" placeholder="Create password" >
                        </div>

                        <!-- Confirm Password input -->
                        <div class="mb-3 text-left">
                            <label for="confirmPassword" class="form-label">Re-enter Password</label>
                            <input type="password" class="form-control" id="confirmPassword" name="confirm_password" placeholder="Confirm password" >
                        </div>

                        <!-- Submit button -->
                        <div class="row">
                            <div class="col-6 ">
                                <div class="mb-3 text-left"><input class="btn btn-primary w-100" type="submit" value="Register"></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Footer -->
            <p class="text-center">© FarmSafe, Inc. 2024</p>
        </div>
    </div>

    <!-- Scripts -->
    <script src="../js/script.js"></script> <!-- Link to JavaScript file -->
    <script src="https://kit.fontawesome.com/yourcode.js" crossorigin="anonymous"></script>
    <script src='https://code.jquery.com/jquery-3.5.1.slim.min.js'></script> <!-- Include jQuery for Bootstrap JS -->
    <script src='https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js'></script> <!-- Include Popper.js for Bootstrap JS -->
     <!-- Include Bootstrap JS -->
     <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js' integrity='sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz' crossorigin='anonymous'></script>

</body>
</html>