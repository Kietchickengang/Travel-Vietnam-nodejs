
// Hien thi ket qua alert box
function showClient(success, msg, time){
    if(success){
        alertBox('success', msg, `Finish time: ${time}`);
        setTimeout(() => {location.reload();}, 2000);
    }
    else{
        alertBox('error', 'Oops...', 'Something went wrong!');
    }
}

// Giao dien alert box
function alertBox(icon, title, text){
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        draggable: false,
        theme: 'dark',
        timer: 2000,
        position: "top",
        width: "30em"
    });
}

// Kiem tra xem client da them moi thanh cong chua
async function showSuccessOrFail(Data){
    const rawResponse = await fetch('/api/new-dest', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(Data)
            })
    
    const formatResponse = await rawResponse.json();
    const {msg, time} = formatResponse;
    const checkStatusCode = (rawResponse.status === 201)? true:false;

    showClient(checkStatusCode, msg, time);
}

// Kiem tra valid Url
function isValidUrlClient(url) {
    try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
        return false;
    }
}

// Thuc hien xoa Card
const handleDelete = async (id) => {
    await fetch(`/api/des/del/${parseInt(id)}`, { // Note: khi fetch, khong co ':' nhu trong route cua web
        method: 'DELETE'
    })
    .then(response => {
        if(response.ok){
            setTimeout(() => {
                console.log(`ID ${id} is deleted`); // Thong bao client card da duoc xoa thanh cong

                location.reload(); // Reload trang web ngay lap tuc
            }, 1000);
        }
        else{
            const resMsg = 'Delete failed';
            console.log(resMsg);
            throw new Error(resMsg);
        }
    });
}

// Hien thi Box canh bao khi Edit hay Delete card
function commitDeleteChangeAlert(id){
    Swal.fire({
            title: "Are you sure?",
            text: "You can't revert this!",
            icon: "warning",
            width: "20em",
            position: "top",

            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!"
    })
    .then((result) => {
        if (result.isConfirmed) {
            handleDelete(id);
            alertBox("success", "Deleted", "Card removed");
        }
        else{
            alertBox("error", "Cancelled", "Nothing changed");
        }
    });
}

// Thuc hien cap nhat Card
async function updateDesCard(formData){
    try{
        await fetch(`/api/des/update/${parseInt(formData.id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData) // editDestination se kiem tra req.body nay
            });
    }
    catch(err){
        console.log(err);
    }
}

// Hien thi Box ask user Save hay Cancel Edit
function askUserWantSaveChange(data){
    Swal.fire({
        title: "Save the changed?",
        showCancelButton: true,
        confirmButtonText: "Save",
    })
    .then(async (result) => {
        if (result.isConfirmed) {
            await updateDesCard(data);
            Swal.fire("Saved!", "", "success");

            setTimeout(() => {window.location.href = '/'}, 2000);
        } 
    });
}