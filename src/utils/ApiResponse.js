class ApiResponse{
    
    constructor(statusCode,data,message){
            this.statusCode = statusCode;
            this.data = data;
            this.message = message;
            this.success = statuscode < 400
    }

}


/*
Informational responses (100 – 199)
Successful responses (200 – 299)
Redirection messages (300 – 399)
Client error responses (400 – 499)
Server error responses (500 – 599)


for status code <400 we get proper response

*/