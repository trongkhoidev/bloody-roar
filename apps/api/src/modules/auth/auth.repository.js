import User from "../../shared/models/user.model.js";

/**
 * AuthRepository — handles direct database access for users.
 */
export class AuthRepository {
    async findByEmail(email, selectPassword = false) {
        const query = User.findOne({ email });
        if (selectPassword) query.select("+password");
        return query;
    }

    async findById(id) {
        return User.findById(id);
    }

    async findByWallet(walletAddress) {
        return User.findOne({ walletAddress: walletAddress.toLowerCase() });
    }

    async create(data) {
        return User.create(data);
    }
    
    async updateById(id, data) {
        return User.findByIdAndUpdate(id, data, { new: true });
    }
}

export default new AuthRepository();
