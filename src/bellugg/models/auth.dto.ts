import {IsEmail, IsString, MinLength, Matches} from 'class-validator'

export class SignupDto {

    @IsString()
    name: string

    @IsEmail()
    email: string

    @IsString()
    username: string

    @MinLength(5)
    password: string
}