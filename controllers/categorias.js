const { response } = require('express');
const { Categoria } = require('../models');
const { findById, findOne } = require('../models/role');


const obtenerCategorias = async(req, res = response ) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, categorias ] = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query)
            .populate('usuario', 'nombre')
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.json({
        total,
        categorias
    });
}

const obtenerCategoria = async(req, res = response ) => {

    const { id } = req.params;
    const categoria = await Categoria.findById( id )
                            .populate('usuario', 'nombre');

    res.json( categoria );

}

const crearCategoria = async(req, res = response ) => {

    try {
        const nombre = req.body.nombre.toUpperCase();

        const categoriaDB = await Categoria.findOne({ nombre });
    
        if ( categoriaDB ) {
            return res.status(400).json({
                msg: `La categoria ${ categoriaDB.nombre }, ya existe`
            });
        }
    
        // Generar la data a guardar
        const data = {
            nombre,
            usuario: req.usuario._id
        }
    
        const categoria = new Categoria( data );
    
        // Guardar DB
        await categoria.save();
    
        res.status(201).json({
            msg:"Categoria Creada exitosamente",
            categoria
        });
    } catch (error) {
        res.status(400).json({
            msg:"Error al crear la categoria",
            error
        })
    }
   

}

const actualizarCategoria = async( req, res = response ) => {

    try {
        const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    data.nombre  = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;

    const CategoriaEstado = await Categoria.findById(id)

    if(CategoriaEstado.estado === false) {
        return res.status(400).json({
            msg:"La categoria ha sido eliminada no es posible editar"
        })
    }


    const categoria = await Categoria.findByIdAndUpdate(id, data, { new: true });

    res.status(200).json({ 
        msg:"Categoria actualizada correctamente",
        categoria 
    });

    } catch (error) {
        res.status(400).json({
            msg: "No se ha podido actualizar la categoria"
        })
    }
}

const borrarCategoria = async(req, res = response ) => {

    try {
        const { id } = req.params;
    const categoriaBorrada = await Categoria.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.status(200).json({
        msg:"Categoria borrada Exitosamente",
        categoriaBorrada
    });
    } catch (error) {
        res.status(400).json({
            msg:"Error al borrar la categoria"
        })
    }
}




module.exports = {
    crearCategoria,
    obtenerCategorias,
    obtenerCategoria,
    actualizarCategoria,
    borrarCategoria
}