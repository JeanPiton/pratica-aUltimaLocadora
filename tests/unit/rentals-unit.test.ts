import {faker} from "@faker-js/faker"
import moviesRepository from "repositories/movies-repository"
import rentalsRepository from "repositories/rentals-repository"
import usersRepository from "repositories/users-repository"
import * as RentalsService from "services/rentals-service"

jest.spyOn(rentalsRepository,"getRentals").mockImplementation(():any=>{
  return [{
    id:faker.number.int(),
    date: new Date(),
    endDate: new Date(),
    userId: faker.number.int(),
    closed: faker.datatype.boolean()
  }]
})

jest.spyOn(rentalsRepository,"getRentalById").mockImplementation((id:Number):any=>{
  return {
    id:id,
    date: new Date(),
    endDate: new Date(),
    userId: faker.number.int(),
    closed: faker.datatype.boolean()
  }
})

jest.spyOn(rentalsRepository,"finishRental").mockResolvedValue()

jest.spyOn(usersRepository,"getById").mockImplementation((id:Number):any=>{
  return {
    id: id,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    cpf: "000.000.000-00",
    birthDate: new Date()
  }
})

jest.spyOn(rentalsRepository,"getRentalsByUserId").mockImplementation(():any=>{return []})

jest.spyOn(moviesRepository,"getById").mockImplementation((id:Number):any=>{
  return {
    id: id,
    name: faker.lorem.sentence(),
    adultsOnly: false,
    rentalId: 0
  }
})

jest.spyOn(rentalsRepository,"createRental").mockResolvedValue()

describe("Rentals Service Unit Tests", () => {
  describe("getRentals:",()=>{
    it("should return rentals", async () => {
      const results = await RentalsService.default.getRentals()
      expect(results).toEqual([{
        id:expect.any(Number),
        date:expect.any(Date),
        endDate:expect.any(Date),
        userId:expect.any(Number),
        closed:expect.any(Boolean)
      }]);
    })
  })

  describe("getRentalById:",()=>{
    it("should return rental with id", async () => {
      const result = await RentalsService.default.getRentalById(0)
      expect(result).toEqual({
        id:0,
        date:expect.any(Date),
        endDate:expect.any(Date),
        userId:expect.any(Number),
        closed:expect.any(Boolean)
      });
    })

    it("should return with not found error",()=>{
      jest.spyOn(rentalsRepository,"getRentalById").mockImplementationOnce(()=>{return undefined})
      const promisse = RentalsService.default.getRentalById(0)
      expect(promisse).rejects.toEqual({
        name: "NotFoundError",
        message: "Rental not found."
      })
    })
  })

  describe("createRental:",()=>{
    it("should return created rental",async ()=>{
      const result = await RentalsService.default.createRental({userId:0,moviesId:[0]})
      expect(result).toBe(undefined)
    })

    it("should return with error user not found",async ()=>{
      jest.spyOn(usersRepository,"getById").mockImplementationOnce(():any=>{return undefined})
      const promisse = RentalsService.default.createRental({userId:0,moviesId:[0]})
      expect(promisse).rejects.toEqual({
        name:"NotFoundError",
        message:"User not found."
      })
    })

    it("should return with error user have open rental",()=>{
      jest.spyOn(rentalsRepository,"getRentalsByUserId").mockImplementationOnce(():any=>{return [0,0]})
      const promisse = RentalsService.default.createRental({userId:0,moviesId:[0]})
      expect(promisse).rejects.toEqual({
        name:"PendentRentalError",
        message:"The user already have a rental!"
      })
    })
  })

  describe("finishRental:",()=>{
    it("should close rental",async ()=>{
      const promisse = await RentalsService.default.finishRental(0)
      expect(promisse).toBe(undefined)
    })
  
    it("should return with error not found",()=>{
      jest.spyOn(rentalsRepository,"getRentalById").mockImplementationOnce(()=>{return undefined})
      const promisse = RentalsService.default.finishRental(0)
      expect(promisse).rejects.toEqual({
        name: "NotFoundError",
        message: "Rental not found."
      })
    })
  })
})