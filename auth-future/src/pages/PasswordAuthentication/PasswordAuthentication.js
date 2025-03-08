import { NavigationBar } from "../../features/NavigationBar/NavigationBar";

export function PasswordAuthentication() {

    return (
        <>
         <h2>Username & Password Authentication</h2>
        
        <div>
            <h3>How username and password authentication works?</h3>
            <p>Usernames are stored in the server database in plaintext, though passwords are not for security reasons.</p>
            <p>The password is hashed with a hashing function such as MD5, SHA-256, bcrypt, etc.</p>
            <p>With hashing functions, it is impossible to simply take the result of a hash and calculate the plaintext version of it.</p>
            <p>
                Unfortunately, this does not prevent attackers from producing a rainbow table which involves pre-computing hashes of all possible passwords so then the hash result can be used to find the plaintext password.
            </p>
            <p>
                The way this is thwarted is by hashing with a unique salt for each password, this means that the same password could be hashed twice but will not have the same hash as different salts are used.
            </p>
            <p>
                As such, if all hashes and salts are breached, with an appropriate password and salt length, it becomes computationally difficult for the attacker to attempt to make a rainbow table for each unique salt to then find out the password.
            </p>
            <p>
                As an additional security measure, a pepper can be used and stored separately to the database, meaning each hash is first hashed with the plaintext password, salt and then the pepper. This makes it extremely computationally difficult to calculate a rainbow table for even a single password as now not only do all plaintext passwords have to be brute forced but all possible peppers need to be brute forced.
            </p>
            <p>
                The security from the pepper is by storing it separately from the database in a highly secure environment, generally it is recommended to have one secret pepper for all users otherwise the tradeoff is that more data will need to be stored securely. 
            </p>
        </div>
        </>
    )
}