```php
<?php
include 'db_config.php'; // Подключение файла конфигурации

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$product_name = $_POST['product_name'];
$price = $_POST['price'];
$quantity = $_POST['quantity'];

$sql = "INSERT INTO orders (product_name, price, quantity) VALUES ('$product_name', '$price', '$quantity')";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
